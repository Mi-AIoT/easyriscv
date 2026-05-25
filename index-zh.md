---
title: "简易 RISC-V"
date: "2026/05/25"
---
<!-- SPDX-License-Identifier: CC0-1.0 -->

[(禁用模拟器版本)](?no-emulator)

:::{.narrow-screen-warning}

本页面不适合在窄屏或无 CSS 的环境下使用。如果您在使用模拟器时遇到问题，请尝试
[禁用模拟器版本](?no-emulator)。

:::

RISC-V 汇编编程交互式入门教程，由 [dramforever](https://github.com/dramforever) 编写。

对代码感兴趣？想要报告问题？请访问 GitHub 页面：
<https://github.com/dramforever/easyriscv>

# 简介

受 [Nick Morgan 的 Easy 6502][easy6502] 启发，这是一个 RISC-V 汇编编程的快速入门教程。
本教程面向对底层计算机科学概念有基本了解但对 RISC-V 不熟悉的读者。

[easy6502]: https://skilldrick.github.io/easy6502/

RISC-V（发音为"risk-five"），如其名所示，是一种 [RISC（精简指令集计算机）][wp-risc]
架构。RISC-V 诞生于加州大学伯克利分校，已经培育了一个由学生、研究人员、工程师和爱好者
组成的活跃社区，致力于软件 and 硬件开发。

[wp-risc]: https://en.wikipedia.org/wiki/Reduced_instruction_set_computer

一些关于 RISC-V 的亮点包括：

- 干净的设计：虽然也是借鉴了许多先前的设计，但 RISC-V 本质上是一个全新且干净的设计。它摒弃了“进位”或“溢出”等整数状态标志，也没有 MIPS 的分支延迟槽。虽然 RISC-V 主要是作为编译器的目标设计的，但手工编写 RISC-V 汇编依然非常舒适。
- 开放标准：RISC-V 规范是公开开发的，任何人都可以免费使用，不存在版权或专利许可问题。世界上许多研究机构和公司都根据这些规范制造了自己的 RISC-V 处理器核心和芯片。
- 社区支持：如果你想制造自己的处理器，相比支付昂贵的 Arm 授权费用或设计一套自己的架构，你可以直接使用 RISC-V。使用 RISC-V 而非自定义架构使你能够直接共享现有且不断增长的软件生态，而无需自行维护。

RISC-V 虽然不像 x86 或 Arm 等老牌架构那样成熟，但发展势头迅猛，并在很多领域（如嵌入式系统、定制处理器、教育和研究等）取得了巨大的成功。

本文将涵盖 32 位最基础的 RV32I_Zicsr 指令集以及特权架构的一个微小部集。你可能很难在实际中找到只支持如此精简指令集的“真实”芯片，它们大多包含更多的*扩展*功能（如浮点数或压缩指令等）。然而，我们在这里所讨论的内容依旧是一套“完整”的指令集。例如，Rust 对 `riscv32i-unknown-none-elf` 目标提供了 [Tier 2 支持][rust-riscv32-none]，这完全可以使用我们在这里讨论的指令来工作。

[rust-riscv32-none]: https://doc.rust-lang.org/nightly/rustc/platform-support/riscv32-unknown-none-elf.html

说到这里，让我们来认识一下即将涵盖的这 45 条指令吧：

```
lui auipc
jal jalr
beq bne blt bge bltu bgeu
lb lh lw lbu lhu sb sh sw
addi slti sltiu xori ori andi slli srli srai
add sub slt sltu xor or and sll srl sra
ecall ebreak
csrrw csrrs csrrc csrrwi csrrsi csrrci
```

其中一部分指令名称对你而言应该十分眼熟（如 `add`, `or`, `xor`），而另外一些看起来很有规律。少数像 `auipc` 这样奇怪的指令也在此列。这些指令构成了 RISC-V 的基石，用来处理处理器最基础的任务。

你也可以窥探在 RISC-V 上编写一个操作系统是什么感觉，即处理异常和特权级。

让我们开始吧。

# 我的第一个 RISC-V 汇编程序

在本文中，你将会看到如下的模拟器窗口：

（如果这只是一个代码块，代表 JavaScript 出现了一些问题，请确认是否已开启 JS 运行...）

```emulator
start:
    addi x10, x0, 0x123
    ebreak
```

你可以使用下方的按钮来控制模拟器。请点击“启动”。一个显示模拟器状态的寄存器面板将会弹出。然后点击“运行”，你会注意到：

```
a0 (x10) 0x00000000
```

变为了：

```
a0 (x10) 0x00000123
```

并且模拟器停止了。恭喜你，你已经成功运行了你的第一个 RISC-V 汇编程序。

# 模拟器控制

“启动”会编译并启动你的代码。如果你的代码存在问题，它会提示错误且不会运行。

模拟器启动后，你可以在右侧面板查看当前寄存器的状态。更多控制按钮也将启用。“运行”会一直执行直到程序结束或点击“暂停”。“单步”会执行单条指令。

如果你尝试“单步”，会发现上面的程序需要两步执行完毕。你可能会猜到，第一步对应的是 `addi`，第二步对应的是 `ebreak`。寄存器面板上方会显示当前指令的地址 `pc`，以及括号中当前的指令。

“导出”会在新标签页或窗口打开一些文本。其中有两个部分，第一部分是符号表，用来展示代码中的标签：

```
# Symbols
# 0x40000000 start
```

第二部分是带有标注的代码版本：

```
start:
{ 0x40000000: 12300513 } addi x10, x0, 0x123
{ 0x40000004: 00100073 } ebreak
```

这告诉你 `addi` 指令被编码为十六进制 `12300513`，并从十六进制地址 `40000000` 开始。同样地，`ebreak` 被编码为 `00100073`，位于十六进制地址 `40000004`。

（注意：RISC-V 指令采用*小端序*，也就是说，`addi` 的 4 个字节在内存中实际排布为 `13 05 30 12`。）

在后续的章节中，我们将详细讨论 `pc`、寄存器、指令、标签以及那两个复选框的作用。

现在，你大概已经猜到了 `addi x10, x0, 0x123` 的意思等同于 `x10 = x0 + 0x123`。至于 `ebreak`，现在只需要记住它会停止模拟器就行了。

<!-- 以下内容暂未翻译，在后续计划中逐步补全 -->
