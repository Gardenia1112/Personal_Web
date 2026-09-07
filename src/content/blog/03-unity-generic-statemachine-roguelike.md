---
title: "Unity 泛型状态机在肉鸽中的应用"
date: 2026-09-03
description: "一套可复用的泛型状态机框架，驱动肉鸽战斗系统。"
tags: ["Unity", "架构"]
draft: false
---

肉鸽战斗里单位状态多、切换频繁：待机、追击、受击硬直、技能前摇后摇、死亡结算还要和 Buff 互相打断。用一长串 `if-else` 很快会变成不可维护的蜘蛛网，于是我抽了一套泛型状态机，让「状态」和「宿主」解耦。

框架核心是 `StateMachine<TContext>`：每个状态实现进入 / 更新 / 退出，切换时统一走 `ChangeState`，保证旧状态一定 Exit、新状态一定 Enter。肉鸽里同一套机子既能挂玩家，也能挂精英怪，只要上下文类型不同即可，避免为每种单位复制一份几乎一样的切换逻辑。

在实战中，技能释放被拆成 `SkillWindup` → `SkillActive` → `SkillRecovery` 三个状态；受击硬直可以打断前摇，但不能打断已经结算伤害的 Active 段。这种规则写在状态自己的 `CanExit` / 事件订阅里，比散落在 Update 里的布尔旗标清晰得多。下面是切换入口的骨架。

```csharp
public void ChangeState(IState<TContext> next) {
  _current?.Exit(_ctx);
  _current = next;
  _current.Enter(_ctx);
}
```

泛型状态机的价值不在「看起来高级」，而在让肉鸽内容迭代时，加一种新怪或新技能只新增状态类，而不是去改一处上帝脚本。后续如果把同一套思路迁到 UI 流程或关卡阶段机，复用成本会更低。
