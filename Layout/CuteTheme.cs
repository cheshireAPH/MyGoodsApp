using MudBlazor;

public class CuteTheme : MudTheme
{
    public CuteTheme()
    {
        // 🌸 ライトモード（かわいい薄紫）
        PaletteLight = new PaletteLight()
        {
            Primary = "#c084f5",     // かわいい紫
            Secondary = "#e3b8ff",   // 薄紫
            Tertiary = "#f3d9ff",    // もっと淡い紫

            Background = "#fff7fb",
            Surface = "#ffffff",

            AppbarBackground = "#ff8fb1",
            AppbarText = "#ffffff",

            DrawerBackground = "#fff7fb",
            DrawerText = "#333333",

            TextPrimary = "#333333",
            TextSecondary = "#555555",

            TableLines = "#f3d7e6",
            Divider = "#f3d7e6"
        };

        // 🌙 ダークモード（黒すぎず、紫寄りでかわいい）
        PaletteDark = new PaletteDark()
        {
            Primary = "#c084f5",     // かわいい紫
            Secondary = "#e3b8ff",   // 薄紫
            Tertiary = "#f3d9ff",    // もっと淡い紫

            Background = "#1e1a22",
            Surface = "#2a2430",

            AppbarBackground = "#2a2430",
            AppbarText = "#ffffff",

            DrawerBackground = "#2a2430",
            DrawerText = "#ffffff",

            TextPrimary = "#f0e6f5",      // ← 白より少し暗い紫がかった白
            TextSecondary = "#d8c8e0",    // ← これも少し暗めに
        };

        LayoutProperties = new LayoutProperties()
        {
            DefaultBorderRadius = "12px"
        };
    }
}
