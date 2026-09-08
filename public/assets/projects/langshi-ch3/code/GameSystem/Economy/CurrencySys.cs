using System;
using UnityEngine;

public class CurrencySys : MonoBehaviour
{
    public static CurrencySys Instance;

    [Header("货币系统配置")]
    [SerializeField] private int currentCurrency = 0;
    [SerializeField] private int totalCurrencyEarned = 0;

    [Header("货币获取配置")]
    public int currencyPerKill = 10;
    public int currencyPerSpecialKill = 25;
    public int currencyPerFanMilestone = 50;
    public int currencyPerLevelUp = 100;

    public event Action<int> OnCurrencyChanged;
    public event Action<int, string> OnCurrencySpent;

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            LoadCurrencyData();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    public void AddCurrency(int amount, string source = "default")
    {
        if (amount <= 0) return;

        currentCurrency += amount;
        totalCurrencyEarned += amount;
        OnCurrencyChanged?.Invoke(currentCurrency);
        GameEvents.TriggerCurrencyChanged(currentCurrency);
        SaveCurrencyData();
    }

    public bool SpendCurrency(int amount, string purpose = "purchase")
    {
        if (currentCurrency < amount)
        {
            return false;
        }

        currentCurrency -= amount;
        OnCurrencyChanged?.Invoke(currentCurrency);
        GameEvents.TriggerCurrencyChanged(currentCurrency);
        OnCurrencySpent?.Invoke(amount, purpose);

        SaveCurrencyData();
        return true;
    }

    public void AddCurrencyFromKill(bool isSpecial = false)
    {
        int amount = isSpecial ? currencyPerSpecialKill : currencyPerKill;
        AddCurrency(amount, isSpecial ? "special_kill" : "kill");
    }

    public void AddCurrencyFromFanMilestone()
    {
        AddCurrency(currencyPerFanMilestone, "fan_milestone");
    }

    public void AddCurrencyFromLevelUp()
    {
        AddCurrency(currencyPerLevelUp, "level_up");
    }

    public bool HasEnoughCurrency(int amount)
    {
        return currentCurrency >= amount;
    }

    private void SaveCurrencyData()
    {
        PlayerPrefs.SetInt("PlayerCurrency", currentCurrency);
        PlayerPrefs.SetInt("TotalCurrencyEarned", totalCurrencyEarned);
        PlayerPrefs.Save();
    }

    private void LoadCurrencyData()
    {
        currentCurrency = PlayerPrefs.GetInt("PlayerCurrency", 0);
        totalCurrencyEarned = PlayerPrefs.GetInt("TotalCurrencyEarned", 0);
    }

    public void ResetCurrency()
    {
        currentCurrency = 0;
        totalCurrencyEarned = 0;
        OnCurrencyChanged?.Invoke(currentCurrency);

        PlayerPrefs.DeleteKey("PlayerCurrency");
        PlayerPrefs.DeleteKey("TotalCurrencyEarned");
    }

    public int CurrentCurrency => currentCurrency;
    public int TotalCurrencyEarned => totalCurrencyEarned;
}