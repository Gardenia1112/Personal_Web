using UnityEngine;

//测试面板是否能打开并正常运作

public class PanelsTester : MonoBehaviour
{
    private string str;
    private int show = 1;
    void Start()
    {
        str= "InGame_Main_Combat";
        UIManager.Instance.ShowPanel(str);
        GameEvents.TriggerPlayerMaxHealthPreChanged(500);
        GameEvents.TriggerPlayerCurrentHealthChanged(500);
    }

    void Update()
    {
        if(Input.GetKeyDown(KeyCode.Alpha1)||Input.GetKeyDown(KeyCode.Alpha2)||Input.GetKeyDown(KeyCode.Alpha3)||Input.GetKeyDown(KeyCode.Alpha4)||Input.GetKeyDown(KeyCode.Alpha5)||Input.GetKeyDown(KeyCode.Alpha6)){

            if(Input.GetKeyDown(KeyCode.Alpha1)){ str= "InGame_End_Win";}
            if(Input.GetKeyDown(KeyCode.Alpha2)){ str= "InGame_End_Lose";}
            if(Input.GetKeyDown(KeyCode.Alpha3)){ str= "InGame_Main_Combat";}
            if(Input.GetKeyDown(KeyCode.Alpha4)){ str= "InGame_Main_Live";}
            if(Input.GetKeyDown(KeyCode.Alpha5)){ str= "InGame_Main_Map";}
            if(Input.GetKeyDown(KeyCode.Alpha6)){ str= "VisualsAndSoundeffectsPanel";}
         if (show == 0)
        {
            UIManager.Instance.ShowPanel(str);
            
            show = 1;
        }
        else
        {
            var CurrentPanel = UIManager.Instance.GetCurrentPanel();
            UIManager.Instance.HidePanel(CurrentPanel);

            show = 0;
        }
        }

         if(Input.GetKeyDown(KeyCode.Alpha7))
        {
            PlayerHPController.Instance.IncreaseMaxHPPre(100);
        }
        if(Input.GetKeyDown(KeyCode.Alpha8))
        {
            
            GameEvents.TriggerPlayerMaxHealthPreChanged(500);
            GameEvents.TriggerPlayerCurrentHealthChanged(500);
        }
        if(Input.GetKeyDown(KeyCode.Alpha9))
        {
            PlayerHPController.Instance.Heal(200);
        }
        if(Input.GetKeyDown(KeyCode.Alpha0))
        {
            PlayerHPController.Instance.TakeDamage(200);
        }
        if(Input.GetKeyDown(KeyCode.T))
        {
            TutorialManager.Instance.ResetTutorial();
            TutorialManager.Instance.StartTutorial();
        }
        if(Input.GetKeyDown(KeyCode.U))
        {
            UIManager.Instance.ShowPanel("InGame_Upgrade");
        }
    }
}
