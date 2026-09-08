using System.Collections;
using System.Collections.Generic;
using UnityEngine;

// 每个面板都要继承这个基类
public abstract class UIPanel : MonoBehaviour
{
    [Header("面板基本信息")]
    public string PanelName;
    [SerializeField] protected bool isActive = false;

    // 要实现的函数如下
    public virtual void Show()
    {
        gameObject.SetActive(true);
        isActive = true;
    }

    public virtual void Hide()
    {
        gameObject.SetActive(false);
        isActive = false;
    }

    // 这个是初始化面板
    public virtual void Initialize()
    {
        if(UIManager.Instance != null)
        {
            UIManager.Instance.RegisterPanel(this);
        }
        isActive = false;
    }

    //面板是否可见
    public virtual bool IsVisible()
    {
        return isActive;
    }
}
