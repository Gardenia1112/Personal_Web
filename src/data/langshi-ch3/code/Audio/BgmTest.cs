using UnityEngine;

public class BgmTest : MonoBehaviour
{
    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Alpha1))
            AudioManager.I.PlaySfx("53");     // 你的音效key

        if (Input.GetKeyDown(KeyCode.Alpha5))
            AudioManager.I.PlayMusic("BgmTest"); // 你的bgm key
    }
}
