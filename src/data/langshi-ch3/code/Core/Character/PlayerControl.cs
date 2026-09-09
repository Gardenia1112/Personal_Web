using UnityEngine;

public class PlayerControl : MonoBehaviour
{
    public bool isOnGround;
    public Core core;

    void Update()
    {
        isOnGround = core.controllerState.IsGrounded;
    }
}