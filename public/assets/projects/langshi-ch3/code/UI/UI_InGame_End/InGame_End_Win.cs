using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
public class InGame_End_Win : UIPanel
{
    public TextMeshProUGUI Kill;

    public TextMeshProUGUI FansGained;

    public TextMeshProUGUI TrafficTime;

    public override void Show()
    {
    base.Show();  // 先调用基类的显示逻辑
    Kill = transform.Find("Kill").GetComponent<TextMeshProUGUI>();
    FansGained = transform.Find("FansGained").GetComponent<TextMeshProUGUI>();
    TrafficTime = transform.Find("TrafficTime").GetComponent<TextMeshProUGUI>();
    Kill.text = "Kill:"+(StatisticsManager.Instance.SessionKillCount).ToString();
    FansGained.text = "FansGained:"+(StatisticsManager.Instance.SessionFansGained).ToString();
    TrafficTime.text = "TrafficTime:"+(StatisticsManager.Instance.SessionTrafficTime).ToString();
    }
}
