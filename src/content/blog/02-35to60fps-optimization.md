---
title: "流浪尸潮 35→60FPS 优化实录"
date: 2026-09-02
description: "从 DrawCall、批处理到对象池，移动端性能翻倍路径。"
tags: ["性能优化", "Unity"]
draft: false
---

《流浪尸潮》在中端安卓机上长期卡在 35FPS 附近，Profiler 里最显眼的不是单帧尖刺，而是持续偏高的 CPU 主线程占用：大量小怪独立 Mesh、频繁 Instantiate/Destroy，以及 UI 与战斗逻辑抢同一帧预算。

第一轮先砍 DrawCall。相同材质的僵尸合批，把「每只怪一张材质球」收敛成共享材质 + GPU Instancing；阴影与后处理按机型分层开关，低端机关掉软阴影后帧时间立刻掉了一截。第二轮做对象池：子弹、受击特效、掉落物全部预热，战斗中只租借与归还，避免 GC 抖动把帧率再打回去。

第三轮才动到真正吃逻辑的部分——AI 更新频率按距离降频，远处单位用简化状态，近处才跑完整感知。对象池的租借接口大致如下，保证取出时重置状态、归还时切断引用，避免「池里脏对象」把下一次生成搞崩。

```csharp
public T Rent<T>() where T : Component {
  var item = _pool.Count > 0 ? _pool.Pop() : CreateNew<T>();
  item.gameObject.SetActive(true);
  item.ResetState();
  return item;
}
```

优化不是一次魔法，而是按 Profiler 证据排队处理。35→60 的路径里，合批与对象池贡献最大；状态机与 AI 降频则保证帧率在尸潮峰值时仍站得住。
