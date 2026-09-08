using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Ability_Base : MonoBehaviour
{
    public bool Initialised;
    protected float Xinput, Zinput;
    public Core core;
    public Character character;
    protected bool jumpInput;

    void Start()
    {
        Init();
    }

    protected virtual void Init()
    {
        core = GetComponent<Core>();
        character = GetComponent<Character>();
        Initialised = true;
    }

    public virtual void PreExecute()
    {
        GetInput();
    }

    public virtual void Execute()
    {

    }

    public virtual void AfterExecute()
    {

    }

    protected virtual void GetInput()
    {
        Xinput = Input.GetAxis("Horizontal");
        Zinput = Input.GetAxis("Vertical");
        jumpInput = Input.GetKeyDown(KeyCode.Space);

        UseInput();
    }

    protected virtual void UseInput()
    {

    }
}