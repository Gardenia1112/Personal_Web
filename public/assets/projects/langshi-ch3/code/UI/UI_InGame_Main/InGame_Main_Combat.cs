using System.Collections;
using System.Collections.Generic;
using System.Threading;
using Microsoft.Unity.VisualStudio.Editor;
using Unity.VisualScripting;
using UnityEngine;
using UnityEngine.UI;

public class InGame_Main_Combat : CombatHUDPanel
{

    private int CurrentBullet;
    private float Currenthealth;
    private float Maxhealth;

    private float CurrenthealthScale = 0.68F;
    private float MaxhealthScale = 1;
    public UnityEngine.UI.Image HealthImage;
    public UnityEngine.UI.Image HealthFillerImage;

    public List<UnityEngine.UI.Image> images = new List<UnityEngine.UI.Image>();

    private void Awake()
    {
        if (HealthImage == null)
            HealthImage = transform.Find("Health")?.GetComponent<UnityEngine.UI.Image>();
        Transform filler = transform.Find("Health/HealthFillerBackground/HealthFiller");
        if (HealthFillerImage == null)
            HealthFillerImage = filler.GetComponent<UnityEngine.UI.Image>();

        Transform container = transform.Find("Bullets");
        if (container == null)
        {
            Debug.Log("InGame_Main_Combat: 找不到 Bullets 容器！检查层级名称");
            return;
        }

        // ⭐ 查找 8 个子弹 Image
        for (int i = 1; i <= 8; i++)
        {
            Transform bullet = container.Find($"Bullet{i}");

            if (bullet != null)
            {
                var img = bullet.GetComponent<UnityEngine.UI.Image>();
                if (img != null)
                {
                    images.Add(img); Debug.Log($"Bullet{i}已加入");
                }
            }
        }
        UpdateBullet(8);
    }

    public override void Show()
    {
        base.Show();

        GameEvents.OnPlayerCurrentHealthChanged += UpdateCurrentHealth;

        Currenthealth = StatisticsManager.Instance.CurrentHealth;
        Maxhealth = StatisticsManager.Instance.MaxHealth;

        UpdateCurrentHealth(Currenthealth);
        UpdateMaxHealth(Maxhealth);
    }

    public override void Hide()
    {
        base.Hide();
        GameEvents.OnPlayerCurrentHealthChanged -= UpdateCurrentHealth;
    }

    public override void UpdateBullet(int count)
    {
        CurrentBullet = count;
        RefreshBullets();
    }

    private void RefreshBullets()
    {
        for (int i = 0; i < images.Count; i++)
        {
            images[i].gameObject.SetActive(i < CurrentBullet);
        }
    }

    public override void UpdateCurrentHealth(float amount)
    {
        Currenthealth = amount;
        RectTransform rect = HealthFillerImage.rectTransform;
        Vector2 size = rect.sizeDelta;
        float width = Currenthealth * CurrenthealthScale;
        size.x = width;
        rect.sizeDelta = size;
    }

    public override void UpdateMaxHealth(float amount)
    {
        Maxhealth = amount;
        RectTransform rect = HealthImage.rectTransform;
        Vector2 size = rect.sizeDelta;
        float width = Maxhealth * MaxhealthScale;
        size.x = width;
        rect.sizeDelta = size;
    }
}
