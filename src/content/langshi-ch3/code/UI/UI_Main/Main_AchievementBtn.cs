using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class UI_Main_AchievementBtn : MonoBehaviour
{
    private Button button;
    void Start()
    {
        // 获取当前 GameObject 上的 Button 组件
        button = GetComponent<Button>();
        
        // 直接添加点击事件
        button.onClick.AddListener(OnStartButtonClick);
    }
    
    void OnStartButtonClick()
    {
        
    }
}
