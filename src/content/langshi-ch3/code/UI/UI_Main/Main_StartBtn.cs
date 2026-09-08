using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;
using UnityEngine;
using UnityEngine.SceneManagement;

public class UI_Main_StartBtn : MonoBehaviour
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
        SceneManager.LoadScene(1);
    }
    
}
