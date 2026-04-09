using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using MudBlazor;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Drawing;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using static System.Net.WebRequestMethods;

namespace MyGoodsApp.Pages
{
    public partial class ImageEditDialog : ComponentBase
    {
        #region プロパティ

        [Inject] public IJSRuntime JS { get; set; }
        [Inject] public HttpClient Http { get; set; }

        [CascadingParameter] public IDialogReference DialogReference { get; set; }

        [Parameter] public ProductVariantViewModel Variant { get; set; }

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
            var bytes = Variant.TempImageBytes ?? await Http.GetByteArrayAsync(Variant.ImageUrl);

            using var image = Image.Load(bytes);

            image.Mutate(x => x.Rotate(90));

            using var ms = new MemoryStream();
            image.SaveAsPng(ms);
            var newBytes = ms.ToArray();

            // ★ 保存前はアップロードしない
            Variant.TempImageBytes = newBytes;

            // ★ プレビュー用に Base64 をセット
            Variant.ImageUrl = $"data:image/png;base64,{Convert.ToBase64String(newBytes)}";
        }

        async Task ApplyCrop()
        {
            var frame = await JS.InvokeAsync<CropFrame>("cropper.getFrame");

            if (CurrentShape == CropShape.Circle)
            {
                Variant.TempImageBytes = CropCircle(
                    Variant.TempImageBytes,
                    frame.X, frame.Y, frame.Width, frame.Height
                );
            }
            else
            {
                Variant.TempImageBytes = CropRectangle(
                    Variant.TempImageBytes,
                    frame.X, frame.Y, frame.Width, frame.Height
                );
            }

            DialogReference?.Close(DialogResult.Ok(Variant));
        }

        byte[] CropRectangle(byte[] originalBytes, int x, int y, int w, int h)
        {
            using var image = Image.Load<Rgba32>(originalBytes);

            var rect = new Rectangle(x, y, w, h);

            image.Mutate(ctx => ctx.Crop(rect));

            using var ms = new MemoryStream();
            image.SaveAsPng(ms);
            return ms.ToArray();
        }

        byte[] CropCircle(byte[] originalBytes, int x, int y, int w, int h)
        {
            using var image = Image.Load<Rgba32>(originalBytes);

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

        void Reset()
        {
            if (Variant?.TempImageBytes != null)
            {
                // TempImageBytes を初期状態に戻す
                Variant.ImageUrl = $"data:image/png;base64,{Convert.ToBase64String(Variant.TempImageBytes)}";
            }
        }

        private void Close()
        {
            DialogReference.Close();
        }

        #endregion

        #region イベント

        protected override void OnParametersSet()
        {
            Console.WriteLine("Dialog側 ImageUrl = " + Variant.ImageUrl);
        }


        protected override async Task OnAfterRenderAsync(bool firstRender)
        {
            if (firstRender)
            {
                await JS.InvokeVoidAsync("cropper.setShape", CurrentShape.ToString().ToLower());
                await JS.InvokeVoidAsync("cropper.setAspectLocked", AspectLocked);
            }
        }

        #endregion

    }

}
