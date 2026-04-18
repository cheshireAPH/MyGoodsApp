using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using MudBlazor;
using MyGoodsApp.Services;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Drawing;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using System.Text.Json;

namespace MyGoodsApp.Pages
{
    public partial class ImageEditPage : ComponentBase
    {
        #region プロパティ

        [Inject] public IJSRuntime JS { get; set; } = default!;
        [Inject] public HttpClient Http { get; set; } = default!;
        [Inject] public SupabaseClientService Supabase { get; set; } = default!;
        [Inject] public LayoutStateService LayoutState { get; set; } = default!;

        [Parameter] public Guid variantId { get; set; }

        public ProductVariantViewModel Variant { get; set; } = new();

        public class CropFrame
        {
            public int X { get; set; }
            public int Y { get; set; }
            public int Width { get; set; }
            public int Height { get; set; }
        }

        #endregion

        #region 定数

        enum CropShape { Rectangle, Square, Circle }

        #endregion

        #region 変数

        CropShape CurrentShape = CropShape.Rectangle;
        bool AspectLocked = false;

        #endregion

        #region メソッド

        /// <summary>トリミング形状</summary>
        string GetCropFrameClass() => CurrentShape switch
        {
            CropShape.Circle => "circle",
            _ => ""
        };

        /// <summary>形状アイコン</summary>
        string GetShapeIcon() => CurrentShape switch
        {
            CropShape.Rectangle => Icons.Material.Filled.Crop,
            CropShape.Square => Icons.Material.Filled.CropSquare,
            CropShape.Circle => Icons.Material.Filled.Circle,
            _ => Icons.Material.Filled.Crop
        };

        /// <summary>形状変更</summary>
        void ToggleShape()
        {
            CurrentShape = CurrentShape switch
            {
                CropShape.Rectangle => CropShape.Square,
                CropShape.Square => CropShape.Circle,
                CropShape.Circle => CropShape.Rectangle,
                _ => CropShape.Rectangle
            };

            JS.InvokeVoidAsync("cropper.setShape", CurrentShape.ToString().ToLower());
        }

        /// <summary>比率ロック</summary>
        void ToggleAspectLock()
        {
            AspectLocked = !AspectLocked;
            JS.InvokeVoidAsync("cropper.setAspectLocked", AspectLocked);
        }

        /// <summary>90度回転</summary>
        async Task Rotate90()
        {
            var bytes = Variant.TempImageBytes!;
            using var image = Image.Load(bytes);

            image.Mutate(x => x.Rotate(90));

            using var ms = new MemoryStream();
            image.SaveAsPng(ms);
            Variant.TempImageBytes = ms.ToArray();
        }

        async Task ApplyCrop()
        {
            var frame = await JS.InvokeAsync<CropFrame>("cropper.getFrame");

            var sourceBytes = Variant.TempImageBytes!;
            byte[] cropped;

            if (CurrentShape == CropShape.Circle)
                cropped = CropCircle(sourceBytes, frame.X, frame.Y, frame.Width, frame.Height);
            else
                cropped = CropRectangle(sourceBytes, frame.X, frame.Y, frame.Width, frame.Height);

            var base64 = Convert.ToBase64String(cropped);

            // ★ PWA 判定
            var hasOpener = await JS.InvokeAsync<bool>("hasOpener");

            if (hasOpener)
            {
                // ★ ブラウザ別タブ：postMessage + close
                await JS.InvokeVoidAsync("postMessageToOpener", variantId.ToString(), base64);
                await JS.InvokeVoidAsync("close");
            }
            else
            {
                // ★ PWA / 同一タブ：localStorage + history.back
                await JS.InvokeVoidAsync("localStorage.setItem", "editedImage",
                    JsonSerializer.Serialize(new
                    {
                        variantId = variantId.ToString(),
                        base64 = base64
                    })
                );

                await JS.InvokeVoidAsync("history.back");
            }
        }

        byte[] CropRectangle(byte[] originalBytes, int x, int y, int w, int h)
        {
            using var image = Image.Load<Rgba32>(originalBytes);

            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (w <= 0 || h <= 0) return originalBytes;

            if (x + w > image.Width) w = image.Width - x;
            if (y + h > image.Height) h = image.Height - y;

            var rect = new Rectangle(x, y, w, h);

            image.Mutate(ctx => ctx.Crop(rect));

            using var ms = new MemoryStream();
            image.SaveAsPng(ms);
            return ms.ToArray();
        }

        byte[] CropCircle(byte[] originalBytes, int x, int y, int w, int h)
        {
            using var image = Image.Load<Rgba32>(originalBytes);

            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (w <= 0 || h <= 0) return originalBytes;

            if (x + w > image.Width) w = image.Width - x;
            if (y + h > image.Height) h = image.Height - y;

            // ① 四角で切り抜き
            image.Mutate(ctx => ctx.Crop(new Rectangle(x, y, w, h)));

            // ② 正方形に揃える
            int size = Math.Min(w, h);
            image.Mutate(ctx => ctx.Resize(size, size));

            // ③ マスク画像を作成（透明）
            using var mask = new Image<Rgba32>(size, size, new Rgba32(0, 0, 0, 0));

            // ④ 白い円を描く（これがマスク）
            mask.Mutate(ctx =>
            {
                ctx.SetGraphicsOptions(new GraphicsOptions
                {
                    Antialias = true,
                    AlphaCompositionMode = PixelAlphaCompositionMode.Src
                });

                ctx.Fill(
                    SixLabors.ImageSharp.Color.White,
                    new EllipsePolygon(size / 2f, size / 2f, size / 2f)
                );
            });

            // ⑤ マスクを適用（白い部分だけ残す）
            image.Mutate(ctx =>
            {
                ctx.SetGraphicsOptions(new GraphicsOptions
                {
                    Antialias = true,
                    AlphaCompositionMode = PixelAlphaCompositionMode.DestIn
                });

                ctx.DrawImage(mask, 1f);
            });

            using var ms = new MemoryStream();
            image.SaveAsPng(ms);
            return ms.ToArray();
        }

        private async Task Cancel()
        {
            var hasOpener = await JS.InvokeAsync<bool>("hasOpener");

            if (hasOpener)
            {
                await JS.InvokeVoidAsync("close");
            }
            else
            {
                await JS.InvokeVoidAsync("history.back");
            }
        }

        string GetPreviewImage()
        {
            if (Variant.TempImageBytes == null)
                return "";

            return $"data:image/png;base64,{Convert.ToBase64String(Variant.TempImageBytes)}";
        }

        #endregion

        #region イベント

        protected override async Task OnInitializedAsync()
        {
            // ★ 1. DB から Variant を取得（まず基本情報だけ）
            var v = await Supabase.Client
                .From<ProductVariant>()
                .Where(x => x.Id == variantId)
                .Single();

            Variant.Id = v.Id;
            Variant.Name = v.Name;
            Variant.ImageUrl = v.ImageUrl;

            // ★ 2. localStorage に編集済み画像があるか確認（PWA用）
            var editedJson = await JS.InvokeAsync<string>("localStorage.getItem", "editedImage");

            if (!string.IsNullOrEmpty(editedJson))
            {
                var obj = JsonSerializer.Deserialize<EditedImageDto>(editedJson);

                if (obj != null && obj.variantId == variantId.ToString())
                {
                    Variant.TempImageBytes = Convert.FromBase64String(obj.base64);

                    // 読み終わったので削除
                    await JS.InvokeVoidAsync("localStorage.removeItem", "editedImage");
                }
            }

            // ★ 3. TempImageBytes がまだ無い場合だけ ImageUrl を使う（fallback）
            if (Variant.TempImageBytes == null)
            {
                if (!string.IsNullOrEmpty(Variant.ImageUrl))
                {
                    if (Variant.ImageUrl.StartsWith("data:"))
                    {
                        var base64 = Variant.ImageUrl.Split(',')[1];
                        Variant.TempImageBytes = Convert.FromBase64String(base64);
                    }
                    else
                    {
                        Variant.TempImageBytes = await Http.GetByteArrayAsync(Variant.ImageUrl);
                    }
                }
                else
                {
                    Variant.TempImageBytes = null;
                }
            }

            // ★ ヘッダー設定
            LayoutState.SetState(
                Variant.Name,
                EventCallback.Factory.Create(this, Cancel),
                EventCallback.Factory.Create(this, ApplyCrop),
                leftMode: HeaderLeftMode.Back,
                showSave: true,
                backText: "キャンセル",
                saveText: "OK"
            );
        }

        public class EditedImageDto
        {
            public string variantId { get; set; }
            public string base64 { get; set; }
        }

        protected override async Task OnAfterRenderAsync(bool firstRender)
        {
            if (firstRender)
            {
                await JS.InvokeVoidAsync("initCropperWhenImageReady");

                await JS.InvokeVoidAsync("cropper.setShape", CurrentShape.ToString().ToLower());
                await JS.InvokeVoidAsync("cropper.setAspectLocked", AspectLocked);
            }
        }

        #endregion
    }
}
