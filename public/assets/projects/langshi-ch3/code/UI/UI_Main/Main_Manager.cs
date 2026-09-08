using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using UnityEditor.Search;

public class UI_Main_Panel : MonoBehaviour
{

    private int show = 0;
    public Image Text;

    public Button[] Buttons;

    void Start()
    {
        Text.gameObject.SetActive(true);
        foreach (var btn in Buttons)
        {
            btn.gameObject.SetActive(false);
        }
    }

    void Update()
    {
        if (show == 0 && Input.anyKeyDown)
        {
            show = 1;
            Text.gameObject.SetActive(false);
            foreach (var btn in Buttons)
            {
                btn.gameObject.SetActive(true);
            }
        }
    }
}
