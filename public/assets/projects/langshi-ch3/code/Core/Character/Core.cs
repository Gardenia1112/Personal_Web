using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Core : MonoBehaviour
{
    public ControllerState controllerState;
    public ControllerParams defaultControllerParams;
    protected ControllerParams overrideControllerParams;


    public ControllerParams CurrentControllerParams
    {
        get
        {
            if (overrideControllerParams != null)
                return overrideControllerParams;
            if (defaultControllerParams != null)
                return defaultControllerParams;

            defaultControllerParams = new ControllerParams();
            return defaultControllerParams;
        }
    }

    public Vector3 Velocity;
    Vector3 positionOffset;
    Transform transform_;
    float currentGravity;
    bool gravityActive = true;

    public LayerMask GroundMask;
    public LayerMask OneWayPlatformMask;

    private CharacterController characterController;

    public GameObject StandingOn;

    void Awake()
    {
        Init();
    }

    private void Init()
    {
        transform_ = this.transform;
        controllerState = new ControllerState();
        characterController = GetComponent<CharacterController>();

        if (characterController == null)
        {
            characterController = gameObject.AddComponent<CharacterController>();
            characterController.height = 2.0f;
            characterController.radius = 0.5f;
        }

        if (defaultControllerParams == null)
        {
            defaultControllerParams = new ControllerParams();
        }
    }

    void Update()
    {
        EveryFrame();
    }

    protected virtual void EveryFrame()
    {
        ApplyGravity();
        PreLogic();
        CastRayBelow();
        MoveCharacter();
        SetStates();
        ResetParams();
    }

    void CastRayBelow()
    {
        float rayLenth = 1.2f;
        Vector3 rayOrigin = transform_.position;

        RaycastHit hit;
        if (Physics.Raycast(rayOrigin, Vector3.down, out hit, rayLenth, GroundMask))
        {
            controllerState.IsGrounded = true;
            StandingOn = hit.collider.gameObject;

            if (hit.distance < characterController.height / 2)
            {
                positionOffset.y = -hit.distance + characterController.height / 2;
            }
        }
        else
        {
            controllerState.IsGrounded = false;
            StandingOn = null;
        }
    }

    void PreLogic()
    {
        positionOffset = Velocity * Time.deltaTime;
        controllerState.WasGroundedLastFrame = controllerState.IsGrounded;
        controllerState.Reset();
    }

    void MoveCharacter()
    {
        if (characterController != null)
        {
            characterController.Move(positionOffset);
        }
        else
        {
            transform_.position += positionOffset;
        }
    }

    void ApplyGravity()
    {
        if (CurrentControllerParams == null)
        {
            return;
        }

        float gravity = CurrentControllerParams.Gravity;
        currentGravity = gravity;

        if (!controllerState.IsGrounded)
        {
            Velocity.y += currentGravity * Time.deltaTime;
            if (Velocity.y < 0) 
            {
                Velocity.y *= 0.98f;
            }
            Velocity.y = Mathf.Clamp(Velocity.y, CurrentControllerParams.MaxFallSpeed, CurrentControllerParams.MaxRiseSpeed);
        }
        else if (Velocity.y < 0)
        {
            Velocity.y = -2f;
        }
    }

    void SetStates()
    {
        if (!controllerState.WasGroundedLastFrame && controllerState.IsGrounded)
        {
            controllerState.JustGotGrounded = true;
        }
    }

    void ResetParams()
    {
        // 重置外部参数等，暂时不写
    }

    public void SetVelocityXZ(float x, float z)
    {
        Velocity.x = x;
        Velocity.z = z;
    }

    public void SetEnableGravity(bool enable)
    {
        gravityActive = enable;
    }

    public void AddVelocity(Vector3 velocity)
    {
        Velocity += velocity;
    }

    public void SetVelocity(Vector3 velocity)
    {
        Velocity = velocity;
    }
    public void SetYforce(float y)
    {
        Velocity.y = y;
    }
    public void Jump(float jumpHeight)
    {
        if (controllerState.IsGrounded)
        {
            if (CurrentControllerParams == null)
            {
                return;
            }

            Velocity.y = Mathf.Sqrt(jumpHeight * -2f * CurrentControllerParams.Gravity);
            controllerState.IsJumping = true;
        }
    }
}

[System.Serializable]
public class ControllerParams
{
    public float Gravity = -30f;
    public float MoveSpeed = 8f;
    public float JumpForce = 12f;
    public float AirControl = 0.8f;
    public float MaxFallSpeed = -50f;
    public float MaxRiseSpeed = 100f;
}

public class ControllerState
{
    public bool IsGrounded { get; set; }
    public bool WasGroundedLastFrame { get; set; }
    public bool JustGotGrounded { get; set; }
    public bool IsJumping { get; set; }

    public bool IsCollidingAbove { get; set; }
    public bool IsCollidingLeft { get; set; }
    public bool IsCollidingRight { get; set; }
    public bool TouchingLevelBounds { get; set; }

    public float LateralSlopeAngel { get; set; }
    public bool SlopeAngelOK { get; set; }
    public float DistanceToLeftColl { get; set; }
    public float DistanceToRightColl { get; set; }
    public float BelowSlopAngel { get; set; }
    public bool OnMovingPlatform { get; set; }

    public void Reset()
    {
        JustGotGrounded = false;
        IsJumping = false;
        IsCollidingAbove = false;
        IsCollidingLeft = false;
        IsCollidingRight = false;
        TouchingLevelBounds = false;
        LateralSlopeAngel = 0;
        SlopeAngelOK = false;
        DistanceToLeftColl = -1;
        DistanceToRightColl = -1;
        BelowSlopAngel = 0;
    }

}