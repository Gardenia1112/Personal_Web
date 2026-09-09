using UnityEngine;
using UnityEngine.EventSystems;

public class CharacterAnimatorController : MonoBehaviour
{
    private Animator animator;
    private static readonly int IsOnGround = Animator.StringToHash("isGrounded");
    private static readonly int XVelocity = Animator.StringToHash("xVelocity");
    private static readonly int ZVelocity = Animator.StringToHash("zVelocity");
    private static readonly int YVelocity = Animator.StringToHash("yVelocity");
    private static readonly int IsJumping = Animator.StringToHash("IsJumping");
    private static readonly int IsShooting = Animator.StringToHash("IsShooting");
    private static readonly int EndShooting = Animator.StringToHash("EndShooting");
    private static readonly int IsReload = Animator.StringToHash("IsReload");
    private static readonly int EndReload = Animator.StringToHash("EndReload");
    private static readonly int IsInjured = Animator.StringToHash("IsInjured");

    void Awake()
    {
        animator = GetComponent<Animator>();
    }

    public void SetIsOnGround(bool value)
    {
        animator.SetBool(IsOnGround, value);
    }

    public void SetXVelocity(float value)
    {
        animator.SetFloat(XVelocity, value);
    }
    public void SetIsInjured(bool value)
    {
        animator.SetBool(IsInjured, value);
    }

    public void SetZVelocity(float value)
    {
        animator.SetFloat(ZVelocity, value);
    }

    public void SetYVelocity(float value)
    {
        animator.SetFloat(YVelocity, value);
    }

    public void SetIsJumping(bool value)
    {
        animator.SetBool(IsJumping, value);
    }
    public void StartShootAnimation()
    {
        animator.SetTrigger("IsShooting"); 
    }

    public void EndShootAnimation()
    {
        animator.SetTrigger("EndShooting"); 
    }

    public void StartReloadAnimation()
    {
        animator.SetTrigger("IsReload"); 
    }

    public void EndReloadAnimation()
    {
        animator.SetTrigger("EndReload"); 
    }
    public AnimatorStateInfo GetCurrentAnimatorStateInfo(int layerIndex)
    {
        return animator.GetCurrentAnimatorStateInfo(layerIndex);
    }
}
