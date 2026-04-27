using MudBlazor;

public class CuteTheme : MudTheme
{
    public CuteTheme()
    {
        // 🌸 ライトモード（かわいい薄紫）
        PaletteLight = new PaletteLight()
        {
            Primary = "#ff8fb1",
            Secondary = "#ffc6d9",
            Tertiary = "#e8b5ce",

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
            Primary = "#ff8fb1",
            Secondary = "#ffc6d9",
            Tertiary = "#e8b5ce",

            Background = "#1e1a22",
            Surface = "#2a2430",

            AppbarBackground = "#2a2430",
            AppbarText = "#ffffff",

            DrawerBackground = "#2a2430",
            DrawerText = "#ffffff",

            TextPrimary = "#ffffff",
            TextSecondary = "#e0d0e8",

            TableLines = "#3a3340",
            Divider = "#3a3340"
        };

        LayoutProperties = new LayoutProperties()
        {
            DefaultBorderRadius = "12px"
        };
    }
}
