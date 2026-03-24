using MudBlazor;

public class CuteTheme : MudTheme
{
    public CuteTheme()
    {
        PaletteLight = new PaletteLight()
        {
            Primary = "#ff8fb1",
            Secondary = "#ffc6d9",
            Background = "#fff7fb",
            Surface = "#ffffff",
            AppbarBackground = "#ff8fb1",
            AppbarText = "#ffffff",
            DrawerBackground = "#fff7fb",
            DrawerText = "#333333"
        };

        LayoutProperties = new LayoutProperties()
        {
            DefaultBorderRadius = "12px"
        };
    }
}