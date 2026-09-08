using UnityEngine;
using UnityEngine.UI;

public class UI_Main_SettingBtn : MonoBehaviour
{
    private bool isPanelOpen = false;
    
    void Start()
    {
        GetComponent<Button>().onClick.AddListener(TogglePanel);
    }
    
    void TogglePanel()
    {
        if (isPanelOpen)
        {
            UIManager.Instance.HidePanel(UIManager.Instance.GetCurrentPanel());
        }
        else
        {
            UIManager.Instance.ShowPanel("VisualsAndSoundeffectsPanel");
        }
        isPanelOpen = !isPanelOpen;
    }
}