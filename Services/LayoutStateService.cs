using Microsoft.AspNetCore.Components;

namespace MyGoodsApp.Services
{
    public enum HeaderLeftMode
    {
        None,
        Back,
        Menu
    }

    public class LayoutStateService
    {
        public string PageTitle { get; private set; } = "";

        public HeaderLeftMode LeftMode { get; private set; } = HeaderLeftMode.Back;

        public bool ShowSaveButton { get; private set; } = true;
        public string BackButtonText { get; private set; } = "← 戻る";
        public string SaveButtonText { get; private set; } = "保存";

        public EventCallback OnBack { get; private set; }
        public EventCallback OnSave { get; private set; }

        public event Action? OnChange;

        public void SetState(
            string title,
            EventCallback onBack,
            EventCallback onSave,
            HeaderLeftMode leftMode = HeaderLeftMode.Back,
            bool showSave = true,
            string backText = "← 戻る",
            string saveText = "保存"
        )
        {
            PageTitle = title;
            OnBack = onBack;
            OnSave = onSave;

            LeftMode = leftMode;
            ShowSaveButton = showSave;

            BackButtonText = backText;
            SaveButtonText = saveText;

            OnChange?.Invoke();
        }
    }
}
