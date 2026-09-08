using System.Collections.Generic;
using UnityEngine;

// 控制所有面板的显示和隐藏
public class UIManager : MonoBehaviour
{
    public static UIManager Instance;
    private Dictionary<string, UIPanel> panelDictionary = new Dictionary<string, UIPanel>();

    [Header("面板配置")]
    private List<UIPanel> allPanels = new List<UIPanel>();
    [Header("调试信息")]
    [SerializeField] private UIPanel currentPanel;
    [SerializeField] private Stack<UIPanel> panelStack = new Stack<UIPanel>();

    // 面板显示/隐藏事件
    public System.Action<UIPanel> OnPanelShown;
    public System.Action<UIPanel> OnPanelHidden;

    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            InitializeManager();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    void InitializeManager()
    {
        panelDictionary.Clear();
        allPanels.Clear();

        // 自动查找当前场景的所有 UIPanel
        var panels = FindObjectsOfType<UIPanel>(true);

        foreach (var panel in panels)
        {
            allPanels.Add(panel);
            panel.Initialize();
            panel.Hide();
            if (!string.IsNullOrEmpty(panel.name) && !panelDictionary.ContainsKey(panel.PanelName))
            {
                panelDictionary.Add(panel.PanelName, panel);
            }
        }

        Debug.Log($"UIManager: 找到 {panels.Length} 个面板");
    }
    // 显示指定面板
    public void ShowPanel(UIPanel panel)
    {
        if (panel == null)
        {
            return;
        }

        // 隐藏当前面板
        if (currentPanel != null && currentPanel != panel)
        {
            currentPanel.Hide();
            OnPanelHidden?.Invoke(currentPanel);
        }

        // 显示新面板
        panel.Show();
        currentPanel = panel;
        panelStack.Push(panel);
        OnPanelShown?.Invoke(panel);
    }

    // 显示面板（通过名称）
    public void ShowPanel(string panelName)
    {
        if (panelDictionary.TryGetValue(panelName, out UIPanel panel))
        {
            ShowPanel(panel);
        }
        else
        {
            Debug.LogWarning($"Panel not found: {panelName}");
        }
    }

    // 隐藏当前面板，返回上一个面板
    public void BackToPrevious()
    {
        if (panelStack.Count > 0)
        {
            var current = panelStack.Pop();
            current.Hide();
            OnPanelHidden?.Invoke(current);

            if (panelStack.Count > 0)
            {
                var previous = panelStack.Peek();
                previous.Show();
                currentPanel = previous;
                OnPanelShown?.Invoke(previous);
            }
            else
            {
                currentPanel = null;
            }
        }
    }

    // 隐藏指定面板
    public void HidePanel(UIPanel panel)
    {
        if (panel != null && panel.IsVisible())
        {
            panel.Hide();
            OnPanelHidden?.Invoke(panel);

            // 从堆栈中移除
            var tempStack = new Stack<UIPanel>();
            while (panelStack.Count > 0)
            {
                var p = panelStack.Pop();
                if (p != panel) tempStack.Push(p);
            }

            // 恢复堆栈
            while (tempStack.Count > 0)
            {
                panelStack.Push(tempStack.Pop());
            }

            if (currentPanel == panel)
            {
                currentPanel = panelStack.Count > 0 ? panelStack.Peek() : null;
            }
        }
    }

    // 隐藏所有面板
    public void HideAllPanels()
    {
        foreach (var panel in allPanels)
        {
            if (panel != null && panel.IsVisible())
            {
                panel.Hide();
            }
        }
        panelStack.Clear();
        currentPanel = null;
    }

    // 获取当前显示的面板
    public UIPanel GetCurrentPanel()
    {
        return currentPanel;
    }

    // 检查面板是否显示
    public bool IsPanelVisible(UIPanel panel)
    {
        return panel != null && panel.IsVisible();
    }
    // 注册面板到管理器
    public void RegisterPanel(UIPanel panel)
    {
        if (!allPanels.Contains(panel))
        {
            allPanels.Add(panel);
            panel.Initialize();
        }
    }

    //获得特定类型面板的泛型方法
    public T GetPanel<T>() where T : UIPanel
    {
        foreach (var panel in allPanels)
        {
            if (panel is T panelofType)
            {
                return panelofType;
            }
        }
        return null;
    }
}