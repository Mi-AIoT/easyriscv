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

# 处理器状态

[程序计数器]{x=term}（program counter）或称 [`pc`]{x=term}，是当前指令的地址。它指向即将被执行的指令。

RV32I 拥有 31 个[通用寄存器]{x=term}，编号为 [`x1` 到 `x31`]{x=reg}。它们可以存放任意 32 位的数据。

（如果你好奇的话，RV32I 中没有状态标志位。）

寄存器 [`x0`]{x=reg} 是一个特殊的“零寄存器”。对于计算指令，你可以在任何需要寄存器的地方使用 `x0`。读取它总是返回零，而写入它的操作会被直接忽略。使用这种特殊的寄存器简化了架构的设计，这一设计也被 MIPS 和 Arm AArch64 所采用。我们很快就会充分利用 `x0`。

（注意：在模拟器中，寄存器视图中 `pc` 旁边括号内列出的指令只是为了方便阅读，它并不是处理器状态的一部分。）

# 指令语法

但在开始讨论指令本身之前，我们需要一种描述[指令语法]{x=term}的方式，这样我才能写给你看。

一条指令的语法是指令名称，后面跟着若干个以逗号分隔的操作数。例如，我们上面看到的这条指令：

```
addi x10, x0, 0x123
```

`x10` 是[目的寄存器]{x=term}，即 [`rd`]{x=term}。下一个操作数是第一个（也是唯一的）[源寄存器]{x=term}，即 [`rs1`]{x=term}。最后一个操作数是[立即数]{x=term}，即 [`imm`]{x=term}。使用这些缩写，我们可以将 `addi` 的语法总结为：

```
addi rd, rs1, imm
```

其他一些指令有第二个源寄存器，即 [`rs2`]{x=term}。例如，不带立即数的 `add` 指令的语法如下：

```
add rd, rs1, rs2
```

还有一些指令没有操作数，比如 `ebreak`。而另一些指令操作数则稍微复杂一点。

# 计算指令

将寄存器作为数字的游乐场，我们可以使用计算指令来对它们进行操作。

## 算术指令

正如我们在上面看到的，你可以让 RISC-V 机器将数字加在一起。

[`addi`]{x=insn} 指令将 `rs1` 中的值与立即数 `imm` 相加，并将结果存入 `rd`。

```
addi rd, rs1, imm
```

[`add`]{x=insn} 指令将 `rs1` 中的值与 `rs2` 中的值相加，并将结果存入 `rd`。

```
add rd, rs1, rs2
```

加法的相反操作是减法。[`sub`]{x=insn} 指令从 `rs1` 中的值减去 `rs2` 中的值（即 `rs1 - rs2`），并将结果存入 `rd`。RISC-V 中没有对应的 `subi` 指令——只需使用带负数的 `addi` 即可。

```
sub rd, rs1, rs2
```

单步执行这个演示程序，并尝试编写你自己的加法和减法：

```emulator
    addi x10, x0, 0x123
    addi x11, x0, 0x555

    addi x12, x10, 0x765
    add x13, x10, x11
    sub x14, x11, x10

    addi x10, x10, 1
    addi x10, x10, 1
    addi x10, x10, -1
    addi x10, x10, -1

    ebreak
```

需要注意的一点是，立即数的值有一个受限的范围，即 `[-2048, 2047]`，这是一个 12 位有符号二进制补码整数的范围。这个限制是因为 RV32I 采用固定的 32 位（即 4 字节）指令长度，而只有高 12 位可用于编码立即数。你可以在“导出”中查看指令中编码的十六进制值。本文不会对指令编码进行更深入的讨论。

```
{ 0x40000000: 12300513 } addi x10, x0, 0x123
{ 0x40000004: 55500593 } addi x11, x0, 0x555
```

Even instructions as simple as addition and subtraction have other interesting
uses. We have already used `addi x10, x0, 0x123` to put `0x123` in the register
`x10`. When writing in assembly, we can use a little shortcut called
[pseudoinstructions]{x=term}. The [`li`]{x=insn} ("load immediate")
pseudoinstruction is a convenient way to put a small value in a register. It
expands to `addi rd, x0, imm` when `imm` is in the range `[-2048, 2047]`.

```
li rd, imm
```

When `imm` is `0`, `addi` copies the value without changing it because adding
zero is the same as doing nothing. The [`mv`]{x=insn} ("move") pseudoinstruction
copies the value from `rs1` to `rd`. It expands to `addi rd, rs1, 0`.

```
mv rd, rs1
```

Using the pseudoinstruction is exactly equivalent to using the "real"
instruction. You can see in the dump that the two are assembled exactly the same
way.

```emulator
    addi x10, x0, 0x123
    li x10, 0x123

    addi x11, x10, 0
    mv x11, x10

    ebreak
```

从零中减去一个数就是求相反数（取反）。0x123 的相反数是多少？

```emulator
    li x10, 0x123
    sub x11, x0, x10

    ebreak
```

嗯，我们得到了 `0xfffffedd`。这是 -291（或 -0x123）的 32 位有符号数[补码]{x=term}表示。关于这一点市面上已经有很多教程了，所以我们只需要记住，每当涉及到“有符号数”时，RISC-V 都会使用补码表示。这样做的好处是不用为有符号和无符号的运算设计两套指令——有符号数和无符号数在发生溢出回绕时表现出相同的行为。

说到溢出回绕，如果我们加了太大的数，导致它溢出会发生什么？我们将使用 `add` 来重复翻倍 `0x123`，看看会发生什么：

```emulator
    li x10, 0x123
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10
    add x10, x10, x10

    ebreak
```

随着 `0x123` 逐渐向高位移动，最终我们得到了 `0x9180_0000`，而在下一次迭代中它变成了 `0x2300_0000`。这就发生了溢出！把 `0x9180_0000` 翻倍会得到 `0x1_2300_0000`，但这在二进制下需要 33 位，因此最高位无法保留在结果中。由于 RISC-V 没有进位或溢出的标志位，溢出的位就被直接丢弃了。这需要程序员自行处理。

## 按位逻辑指令

既然谈到了位（bit），我们还可以对它们进行按位逻辑操作。

[`and`]{x=insn} 指令对 `rs1` 和 `rs2` 的各个位执行按位“与”（AND）操作，并将结果存入 `rd`。[`or`]{x=insn} 和 [`xor`]{x=insn} 指令则分别执行按位“或”（OR）和按位“异或”（XOR）操作。

```
and rd, rs1, rs2
or rd, rs1, rs2
xor rd, rs1, rs2
```

这三条指令也都存在立即数操作数版本，即 [`andi`]{x=insn}、[`ori`]{x=insn}、[`xori`]{x=insn}。

```
andi rd, rs1, imm
ori rd, rs1, imm
xori rd, rs1, imm
```

这里有一些可以尝试的随机位运算示例：

```emulator
    li x10, 0x5a1
    xori x10, x10, 0xf0
    xori x10, x10, -1

    li x11, 0x5a1
    addi x12, x11, -1
    and x11, x11, x12
    addi x12, x11, -1
    and x11, x11, x12
    addi x12, x11, -1
    and x11, x11, x12

    li x13, 0x5a1
    ori x14, x13, 0xf
    ori x14, x13, 0xff
    ori x14, x13, 0xf0

    ebreak
```

请记住立即数的值处于 `[-2048, 2047]` 范围之内。对于负数，所采用的补码表示意味着高位全部为 1。例如，使用 `-1` 作为 `imm` 意味着第二个操作数是二进制的全部为 1，即 `0xffff_ffff`。这使得我们可以将 `xori rd, rs1, -1` 当作按位“非”（NOT）来使用。

```emulator
    li x10, 0x5a1
    xori x11, x10, -1

    or x12, x10, x11
    add x13, x10, x11

    ebreak
```

另一个有趣的位操作是将某个值向上或向下舍入/[对齐]{x=term}（align）到 2 的幂的倍数。例如，如果你想找到小于 `a` 的最接近 16 的倍数，在二进制中相当于清除最低的 4 位，即 `a & ~0b1111`。在补码表示法中，这非常方便地等同于 `a & -16`。

向上对齐就没那么直白了，一种直观的想法是先加上 16。然而这对于本就是 16 的倍数的数会得出错误的结果。不过解决起来也很简单：加上比对齐大小少 1 的数即可，即 `(a + 15) & -16`。

```emulator
    li x10, 0x123
    andi x11, x10, -16

    addi x12, x10, 15
    andi x12, x12, -16
    ebreak
```

## 比较指令

通常当你编写某种比较操作（如 `a == b` 或 `a >= b`）时，它们会被用作 `if` 或循环的条件，但……这些东西太复杂了！我们稍后再谈。

有时你只想从比较中获取一个布尔值。C 语言的惯例是使用 1 表示真（true），0 表示假（false），既然现在的世界都在运行 C 语言，RISC-V 也就顺理成章地提供了这种机制。

在 C 语言中有六种比较运算符：

```
== != < > <= >=
```

被比较的值可以全是有符号数，也可以全是无符号数。

那么有多少条比较指令供我们支配呢？让我们看看……

[`slt`]{x=insn}（“小于则置位”，set less than）指令将 `rs1` 和 `rs2` 作为有符号的 32 位整数进行比较。如果 `rs1 < rs2` 则将 `rd` 置为 `1`，否则置为 `0`（即 `rs1 >= rs2`）。[`sltu`]{x=insn} 指令与之类似，但它将操作数视为无符号值。[`slti`]{x=insn} 和 [`sltiu`]{x=insn} 的逻辑类似，不同点在于第二个操作数是立即数。

```
slt rd, rs1, rs2
sltu rd, rs1, rs2
slti rd, rs1, imm
sltiu rd, rs1, imm
```

（冷门旁注，为了完整起见：对于 `sltiu`，立即数操作数的范围依然是 `[-2048, 2047]`，但它会对 `rs1` 和立即数（的补码表示）进行*无符号*比较。这使得某些反直觉但很便利的用例成为可能。例如，将 `rs1` 解释为有符号数：

```
                    # C 伪代码:
sltiu rd, rs1, 42   #   rd = (rs1 >= 0) && (rs1 < 42)
sltiu rd, rs1, -1   #   rd = (rs1 != -1)
```

你现在不需要完全理解这一点。截至 2025 年 10 月，甚至 GCC 都无法实现第二种优化。）

至此……六种比较中的一种已经解决。其他的怎么办？事实证明，我们可以使用最多两条指令来合成其他五种比较。

通过交换操作数，可以很容易地将 `<` 变为 `>`。使用带 `1` 的 `xori`，我们可以反转比较的结果，从而得到 `<=` 和 `>=`。

```emulator
    li x10, 0x3
    li x11, 0x5

    slt x12, x10, x11   # x10 < x11
    slt x13, x11, x10   # x10 > x11

    xori x14, x12, 1    # x10 >= x11  即  !(x10 < x11)
    xori x15, x13, 1    # x10 <= x11  即  !(x10 > x11)

    ebreak
```

上面介绍的是有符号比较，无符号比较也只需将 `slt` 换成 `sltu`，其余操作完全相同。

至于 `==` 和 `!=`，让我们先来解决更简单的 `a == 0` 和 `a != 0` 的情况。我们会利用这样一个事实：对于无符号数，`a != 0` 等价于 `a > 0`。其否定是 `a <= 0`，这相当于 `a < 1`。

```emulator
    li x10, 0

    sltu x11, x0, x10   # 0 <u x10  即  x10 != 0
    sltiu x12, x10, 1   # x10 <u 1  即  x10 == 0

    ebreak
```

作为奖励，这也是我们获得逻辑非以及将整数转换为布尔值的方法。

既然有了这些，`a == b` 就相当于 `(a - b) == 0`，而 `a != b` 则相当于 `(a - b) != 0`。

```emulator
    li x10, 0x3         # a
    li x11, 0x5         # b
    sub x10, x10, x11   # x10 = a - b

    sltu x11, x0, x10   # 0 <u x10  即  x10 != 0
    sltiu x12, x10, 1   # x10 <u 1  即  x10 == 0

    ebreak
```

总结如下：（`[u]` 表示在无符号比较时使用 `u`，有符号比较时留空）

- `a < b`: `slt[u]`
- `a > b`: 颠倒操作数顺序后的 `slt[u]`
- `a <= b`: 颠倒操作数顺序后的 `slt[u]` ；然后 `xori 1`
- `a >= b`: `slt[u]` ；然后 `xori 1`
- `a == 0`: 对 `x0` 进行 `sltiu 1`
- `a != 0`: 对 `x0` 进行 `sltu`
- `a == b`: `sub` ；然后对结果进行对 `x0` 的 `sltiu 1`
- `a != b`: `sub` ；然后对结果进行对 `x0` 的 `sltu`

## 移位指令

在 RISC-V 汇编教程的篇幅里，我很难详尽阐述位移（bit shifts）的各种巧妙用途。既然你读到了这里，大概已经对它们有所耳闻。它们在 RISC-V 中的使用方式并没有什么特别之处。

右移有两种变体：[`srl`]{x=insn} 和 [`srli`]{x=insn}（“逻辑右移 (立即数)”，shift right logical (immediate)）执行“逻辑”或无符号右移，其中最左边或最高有效位会被填 0。

[`sra`]{x=insn} 和 [`srai`]{x=insn}（“算术右移 (立即数)”，shift right arithmetic (immediate)）执行“算术”或有符号右移，其中最左边的位会用与原最高位（符号位）相同的值来填充。因此，如果你右移一个负数，会得到一个负的结果；如果右移一个非负数，会得到一个非负的结果。

```
srl rd, rs1, rs2
sra rd, rs1, rs2
srli rd, rs1, imm
srai rd, rs1, imm
```

同前所述，带有 `i` 后缀的指令以立即数作为第二个操作数，而不带 `i` 的则以寄存器作为操作数。

```emulator
    li x10, -3
    srai x11, x10, 16
    srli x12, x10, 16
    ebreak
```

所以 `a` 代表“算术”（arithmetic），`l` 代表“逻辑”（logical）。明白。

左移则没有这种区分。为了保持一致性，它们依然被归为“逻辑”左移：[`sll`]{x=insn} 是左移，而 [`slli`]{x=insn} 是带立即数的左移。

```
sll rd, rs1, rs2
slli rd, rs1, imm
```

啊哈，现在我们可以让 `0x123` 迅速膨胀，而不需要重复写那么多行代码了：

```emulator
    li x10, 0x123
    slli x10, x10, 10
    slli x10, x10, 10
    slli x10, x10, 10
    ebreak
```

移位指令的立即数非常特殊：它们只能处于 `0` 到 `31`（含）的范围内，因为移位负数或移位超过 31 位是没有意义的。当移位数从寄存器中读取时，该值会被视为对 32 取模，换句话说，只有最低的 5 位会被考虑：

```emulator
    li x10, 0x444
    li x11, 0x81

    srl x10, x10, x11   # 相当于移位 1 位

    ebreak
```

为了找点乐子，我们来尝试将一个值乘以 10——这是你在解析十进制数字时经常需要做的：`a * 10` 可以被改写为 `(a << 1) + (a << 3)`：

```emulator
    li x10, 0x5

    slli x11, x10, 1
    slli x12, x10, 3
    add x11, x11, x12

    ebreak
```

## 这就没了……？

这就没了？

你可能已经注意到了某些显而易见的缺失。我们目前所学的内容甚至都无法覆盖小学的数学运算：乘法和除法都不见了。

RISC-V 在设计时就考虑了[扩展]{x=term}（extensions）。正如前言中所述，RV32I 是最最基础指令集的骨架。如果强迫每个人都必须在他们的处理器中加入乘除法，哪怕是在一些根本不需要这些运算的场景下，这也会导致每一颗芯片浪费芯片面积与资金。相反，RISC-V 处理器的设计者拥有极大的选择自由，以至于有些人会觉得他们拥有了过多的自由。

至于我们……说实话，我很庆幸我们拿到的是这样一幅可以被完全讲透的牌。如果不是因为 RV32I 如此精简，我可能根本写不完这个教程。

## 计算指令总结

（操作数 `a` 代表 `rs1`，而 `b` 代表 `rs2` 或立即数。在指令名称中，`[i]` 表示存在立即数变体。下标 `u` 表示无符号数，`s` 表示补码表示的有符号数。）

| 指令 | 运算 | 立即数范围 |
|---|----|---|
| `add[i]` | `a + b` | `[-2048, 2047]` |
| `sub` | `a - b` | (不适用) |
| `slt[i]` | <code>(a &lt;<sub>s</sub> b) ? 1 : 0</code> | `[-2048, 2047]` |
| `slt[i]u` | <code>(a &lt;<sub>u</sub> b) ? 1 : 0</code> | `[-2048, 2047]` |
| `xor[i]` | `a ^ b` | `[-2048, 2047]` |
| `or[i]` | `a | b` | `[-2048, 2047]` |
| `and[i]` | `a & b` | `[-2048, 2047]` |
| `sll[i]` | `a << b` | `[0, 31]` |
| `srl[i]` | <code>a &gt;&gt;<sub>u</sub> b</code> | `[0, 31]` |
| `sra[i]` | <code>a &gt;&gt;<sub>s</sub> b</code> | `[0, 31]` |

# 间奏：更大的数字

`addi` 指令对立即数的值有限制。我们要如何构建更大的数值？

[`lui`]{x=insn}（“加载高位立即数”，load upper immediate）指令接收一个处于 `[0, 1048575]` 范围（即最大为 <code>2<sup>20</sup> - 1</code>）内的立即数，并将 `rd` 设为该值左移 12 位后的结果：

```
lui rd, imm20
```

这听起来……有点让人困惑。让我们来动手试试：

```emulator
    lui x10, 1
    lui x11, 2
    ebreak
```

与使用 `li` 加载“低位”立即数不同，我们直接控制写入寄存器的*高* 20 位。在这之后，我们可以使用另一条 `addi` 指令来填充低位。例如，如果我们想要得到 `0x12345`：

```emulator
    lui x10, 0x12
    addi x10, x10, 0x345
    ebreak
```

为了方便起见，在汇编中你可以使用 [`%hi()`]{x=rel} 和 [`%lo()`]{x=rel} 来提取一个数值的高 20 位和低 12 位。前一个例子也可以写成：

```emulator
    lui x10, %hi(0x12345)
    addi x10, x10, %lo(0x12345)
    ebreak
```

让 `lui` 处理高 20 位，`addi` 处理低 12 位，你就可以构造出任意 32 位数值。

（如果需要使用的数值的第 11 位（从 0 开始计数）为 1，就会出现一个小小的复杂情况。在这种情况下，`addi` 的立即数操作数必须是负数。不过 `%hi` 能够理解这一点并加 1 进行补偿，因此 `%hi` 和 `%lo` 的组合可以完美适用于所有情况。）

# 跳转和分支

到目前为止，我们介绍的全部内容甚至在最简陋的程序员计算器上也能实现。要让计算机真正发挥……计算机的作用，我们还需要循环和条件分支。

在 RISC-V 的术语中，[分支]{x=term}（branch）是指有条件的控制流转移，而[跳转]{x=term}（jump）是指无条件的控制流转移。

我认为分支指令更简单一些，所以我们先从分支指令开始。

## 分支

所有的分支指令都遵循“如果满足某种比较条件，就转到某处”的形式。这些条件包括：

- [`beq`]{x=insn}: `rs1 == rs2` （相等）
- [`bne`]{x=insn}: `rs1 != rs2` （不相等）
- [`blt`]{x=insn}: `rs1 < rs2` 有符号比较（小于）
- [`bge`]{x=insn}: `rs1 >= rs2` 有符号比较（大于或等于）
- [`bltu`]{x=insn}: `rs1 < rs2` 无符号比较（小于无符号）
- [`bgeu`]{x=insn}: `rs1 >= rs2` 无符号比较（大于或等于无符号）

（如果你对这里比较运算符的顺序选择感到困惑，其实这只是因为 `<` 的否定是 `>=`。）

```
beq rs1, rs2, label
bne rs1, rs2, label
blt rs1, rs2, label
bge rs1, rs2, label
bltu rs1, rs2, label
bgeu rs1, rs2, label
```

噢对，差点忘了解释标签（labels）是什么。标签是代码中某些行地址的便利标识符。它们由一个标识符后面加上一个冒号组成（例如 `this:`）。标签可以单独占据一行，也可以出现在该行任何指令之前。你可以使用“导出”按钮来查看它们所指向的地址。分支指令的第三个操作数就是当条件成立时要跳转到的标签。

让我们将 1 到 100 的所有数字加起来：

```emulator
    li x10, 100         # i = 100
    li x11, 0           # sum = 0

loop:
    add x11, x11, x10   # sum = sum + i
    addi x10, x10, -1   # i = i - 1
    blt x0, x10, loop   # 如果 i > 0: 再次循环
                        # 否则: 结束

    ebreak
```

你可以试着编写你最喜欢的循环，比如斐波那契数列之类的。既然说到了动手尝试，为了做好准备，这里是一个无限循环的例子。尝试暂停或停止该循环，并单步执行这些指令。

```emulator
loop:
    addi x10, x10, 1
    add x11, x11, x10
    beq x0, x0, loop
```

（如果你对浏览器中的 JavaScript 有所了解，你就会知道 JavaScript 中真正的无限循环会让整个页面变得无响应，除非它是在 Worker 或其他机制中运行。这里的“运行”按钮只是让模拟器执行特定步数的指令，并在执行间隙将控制权交还给事件循环。）

（这不是编写无条件跳转的首选方式。我们稍后会看到什么是首选方式。）

顺便说一下，这里没有 `bgt[u]` 或 `ble[u]`，因为你只需交换 `rs1` 和 `rs2` 就可以实现它们。

## 跳转

RISC-V 中有两条跳转指令。其中一条是 [`jal`]{x=insn}（“跳转并链接”，jump and link），它将 `rd` 设为下一条指令 of 地址，然后跳转到某个标签：

```
jal rd, label
```

另一条是 [`jalr`]{x=insn}（“寄存器跳转并链接”，jump and link register），它将 `rd` 设为下一条指令的地址，然后跳转到由 `imm + rs1` 计算出的地址：

```
jalr rd, imm(rs1)
```

（实际上，跳转的目标地址是 `(imm + rs1) & ~1`，即清除了最低有效位。这种区别在常规代码中几乎永远不会遇到。）

哎呀，这语法看起来有点奇特。当你看到像这样的括号时，它与*地址*有关。括号意味着地址。

这……要做的事情还是有点多。让我们先看看一些更简单的情况：如果 `rd` 是 `x0`，那么这些指令唯一做的就是跳转。我们可以使用它来代替分支指令以实现无条件跳转。

```emulator
loop:
    # 是的，这是一个无限循环。
    # 你可以看到我们一遍又一遍地
    # 执行这一条指令
    jal x0, loop
```

为了方便起见，你可以使用一条伪指令：[`j`]{x=insn}（“跳转”，jump）代表 `rd` 为 `x0` 的 `jal`：

```
j label
```

至于为什么你想要这样做……因为我们的每条指令只有 32 位，而且既然 `jal` 指令只需要一个寄存器编号（而不是分支指令的两个），并且不需要判断条件，指令编码就允许跳转到更远的范围。因此在跳转时，这总是比 `beq x0, x0, label` 这样的写法更受青睐。

对于 `jalr`，你可以跳转到存放在寄存器中的地址。在 C 语言中，这相当于操作函数指针。每当需要动态分派时，你就需要使用它。例如，在跳转到 `foo` 之前，我们先把它的地址加载到一个寄存器中。

```emulator
    lui x10, %hi(foo)
    addi x10, x10, %lo(foo)
    jalr x0, 0(x10)

    # 这行不会被执行
    li x12, 1
    ebreak

foo:
    # 这行会被执行
    li x12, 2
    ebreak
```

如果你到现在已经忘了，最开始的 `lui`/`addi` 组合就是把标签 `foo` 的地址存入寄存器 `x10`。

类似于 `j`，[`jr`]{x=insn}（“寄存器跳转”，jump register）是 `rd` 为 `x0` 且 `imm` 为 `0` 的 `jalr` 伪指令：

```
jr rs1
```

嗯……如果我们其实不需要 `x10` 中的地址，那条 `addi` 就是多余的，因为 `jalr` 自身就有能力加上低位立即数：

```emulator
    lui x10, %hi(foo)
    jalr x0, %lo(foo)(x10)

    # 这行不会被执行
    li x12, 1
    ebreak

foo:
    # 这行会被执行
    li x12, 2
    ebreak
```

相比于 `jal x0`，这有什么优势呢？由于 `%hi` and `%lo` 可以表示任意 32 位值，这个双指令组合可以跳转到任何地址，不受范围限制。当然，你需要一个空闲的暂存寄存器来存放地址的高位，但既然 RISC-V 给你提供了 31 个通用寄存器，这应该不会是什么大问题。

## 跳转并链接

那么目的寄存器又有什么用呢？你为什么需要下一条指令的地址？当然是为了跳转*回来*。我们可以使用这个功能来调用函数并返回。

```emulator
    li x10, 1
    jal x1, double  # 调用 double
    jal x1, double  # 调用 double
    ebreak

    # 将 x10 中的值翻倍
double:
    add x10, x10, x10
    jr x1           # 返回
```

请注意，我为此使用了寄存器 `x1`，按照惯例，这是用于提供返回地址的寄存器。为了方便起见，如果 `jal` 中省略了目的寄存器，它会默认使用 `x1`。同时，[`ret`]{x=insn}（“返回”，return）是一条伪指令，代表 `jr x1`，即 `jalr x0, 0(x1)`：

```
jal label
ret
```

所以上面的例子可以被更方便地改写为：

```emulator
    li x10, 1
    jal foo
    jal foo
    ebreak

foo:
    add x10, x10, x10
    ret
```

# 内存

我们这台电脑真不错。现在我们拥有了……通用寄存器中总共 31 &times; 4 = 124 字节的存储空间供我们使用。但我想要更多……

## 基础内存访问

模拟器拥有从地址 `0x4000_0000` 开始的 1 MiB 内存。也就是说范围是 `0x4000_0000` 到 `0x400f_ffff`（含）。正如你在导出中看到的，汇编器从内存起始位置开始汇编，也就是从地址 `0x4000_0000` 开始。

[`.word`]{x=dir}[指示符]{x=term}（directive）直接在当前位置放入一个 4 字节/32 位的字（word）。你可以指定以逗号分隔的多个值。

```
.word value [ , value [ , ...  ] ]
```

[`lw`]{x=insn}（“加载字”，load word）指令从地址 `rs1 + imm` 加载一个字并放入 `rd`，换句话说就是从内存中读取该字：

```
lw rd, imm(rs1)
```

与 `jalr` 类似，你可以将它与 `lui` 结合使用来访问任何地址。

```emulator
    lui x10, %hi(foo)
    lw x11, %lo(foo)(x10)
    ebreak

foo:
    # 懂了吗？foo, f00 ...
    .word 0xf00
```

[`sw`]{x=insn}（“存储字”，store word）指令将 `rs2` 中的内容存储到内存地址 `rs1 + imm` 处的一个字中，换句话说就是将该字写入内存：

```
sw rs2, imm(rs1)
```

```emulator
    lui x10, %hi(foo)
    lw x11, %lo(foo)(x10)

    li x12, 0x123
    sw x12, %lo(foo)(x10)

    # 现在它被改变了
    lw x13, %lo(foo)(x10)
    ebreak

foo:
    .word 0xf00
```

为了彻底弄清这一点，我们需要明确：[加载]{x=term}（load）意味着从内存中读取，[存储]{x=term}（store）意味着写入到内存。这两个词既可以作名词也可以作动词。另外，在 RISC-V 中，一个[字]{x=term}（word）是 32 位的。

让我们来找点乐子。我们能让程序读取它自己吗？

```emulator
here:
    lui x10, %hi(here)
    lw x10, %lo(here)(x10)
    ebreak
```

噢那很有意思。这是否意味着我也可以只用 `.word` 来写程序？

```emulator
    .word 0x40000537 # lui x10, %hi(here)
    .word 0x00052503 # lw x10, %lo(here)(x10)
    .word 0x00100073 # ebreak
```

噢真不错。这仅仅是瞥了一眼机器码和指令编码的世界……而我们不会深入讨论这些。

掌握了内存访问之后，我们就可以轻松处理更多的数据了。这里有一个例子，我们在其中求数组中所有值的和。注意我们是如何访问不同的内存地址的，而在寄存器中，我们无法通过另一个寄存器中的编号来定位某一个寄存器。

```emulator
    lui x10, %hi(array)
    addi x10, x10, %lo(array)

    li x11, 8   # 长度

    # 获取结束地址
    slli x11, x11, 2
    add x11, x11, x10

    li x12, 0 # 累加和

loop:
    # 如果当前地址 == 结束地址，完成
    beq x10, x11, end
    lw x13, 0(x10)      # 从数组加载
    add x12, x12, x13   # 加到累加和中
    addi x10, x10, 4    # 移动当前指针到下一个元素
    j loop

end:
    ebreak


array:
    .word 13, 24, 6, 7, 8, 19, 0, 4
```

对应的 C 语言代码大概类似于：

```
uint32_t array[], length;

uint32_t *current = array;
uint32_t *end = array + length;
uint32_t sum = 0;

for (; current != end; current ++) {
    sum += *current;
}
```

注意，在 C 语言中给指向字的指针加 1 会把地址增加 4，因为所有的地址都是按字节寻址的，而一个字是四个字节。在 C 语言中，编译器会为你处理乘数，但在汇编中，你必须记住手动完成它。

## 更窄的宽度

内存中的数据并不全都是字（word）大小的。你已经见过了数组，它是多个字大小的。但也存在比字更小的数据。

最显而易见的是[字节]{x=term}（byte），它是 1 字节/8 位的，在 C 语言中写作 `[u]int8_t`。介于两者之间的是[半字]{x=term}（halfword），它是 2 字节/16 位的，在 C 语言中写作 `[u]int16_t`。你可以分别使用 [`.byte`]{x=dir} 和 [`.half`]{x=dir}[指示符]{x=term}（directive）来定义这些数据类型。

```
.byte value [ , value [ , ...  ] ]
.half value [ , value [ , ...  ] ]
```

如果你记不住这些，[`.2byte`]{x=dir} 与 `.half` 意思相同，而 [`.4byte`]{x=dir} 与 `.word` 意思相同。

```
.2byte value [ , value [ , ...  ] ] # 与 .half 相同
.4byte value [ , value [ , ...  ] ] # 与 .word 相同
```

将小于字大小的值加载到字大小的寄存器中会有一个小问题：其余的位要怎么处理？显然，低位会获取加载的实际值。而填充高位有两种最常用的方式：

- [零扩展]{x=term}（zero extension）：高位全部用 0 填充
- [符号扩展]{x=term}（sign extension）：高位全部用原始值的最高位（符号位）的副本填充

零扩展非常简单。顾名思义，符号扩展与有符号的值有关。它是将较窄的有符号值转换为较宽的有符号值时发生的操作。

（保持其余的位不变并不是一个好选择。对于处理器，尤其是现代高性能设计的处理器来说，只写入寄存器的一部分会使硬件实现复杂化。如果新值不依赖于旧值，硬件实现起来是最简单的。）

例如，有符号字节值 `-100` 的十六进制是 `0x9c`。由于其最高位（即符号位）为 `1`，当我们将它扩展为 32 位时，我们在高 24 位中全部填充 1，因此新值 `0xffff_ff9c` 仍然表示 `-100`。这就是符号扩展。

如果我们想把无符号字节值 `156`（同样是 `0x9c`）转换为无符号字，为了保持其数值不变，它必须是 `0x0000_009c`。这就是零扩展。

对于字节，[`lb`]{x=insn}（“加载字节”，load byte）指令加载一个字节并对结果进行符号扩展，而 [`lbu`]{x=insn}（“加载无符号字节”，load byte unsigned）指令执行相同的操作，但对结果进行零扩展。与 `lw` 类似，地址是 `rs1 + imm`。

```
lb rd, imm(rs1)
lbu rd, imm(rs1)
```

类似地，[`lh`]{x=insn}（“加载半字”，load half）和 [`lhu`]{x=insn}（“加载无符号半字”，load half unsigned）用于无符号半字（记住，每个半字是两个字节）：

```
lh rd, imm(rs1)
lhu rd, imm(rs1)
```

我们可以尝试运行一下之前的符号扩展和零扩展的例子。

```emulator
    # 有符号
    li x10, -100
    lui x11, %hi(test)
    lb x11, %lo(test)(x11)

    # 无符号
    li x12, 156
    lui x13, %hi(test)
    lbu x13, %lo(test)(x13)

    ebreak

test:
    .byte 0x9c
```

相应地，[`sb`]{x=insn}（“存储字节”，store byte）和 [`sh`]{x=insn}（“存储半字”，store half）执行与 `lb` and `lh` 相反的操作，将字节和半字存储到内存中。这些指令不需要将较窄的值加宽到寄存器大小，而是从 `rs2` 中提取最低位，并将其存储到内存中。（这里没有 `sbu` 和 `shu`，因为存储是窄化操作，而不是加宽操作。）

```
sb rs2, imm(rs1)
sh rs2, imm(rs1)
```

顺便再提两个小细节。首先是[字节序]{x=term}（endianness）。虽然理论上可以存在大端序（big endian）的 RISC-V 机器，但我从未见过……而且这个模拟器使用的是小端序，这意味着字中的四个字节在内存中是按低位在前的顺序排布的。因此，`.byte 0x1, 0x2, 0x3, 0x4` 与 `.word 0x04030201` 完全相同。

```emulator
    lui x10, %hi(test)
    lw x10, %lo(test)(x10)
    ebreak

test:
    .byte 0x1, 0x2, 0x3, 0x4
```

其次，为了达到最高效率，内存访问应当是[对齐]{x=term}（aligned）的。这意味着半字（2字节）的地址应该是 2 的倍数，字（4字节）的地址应该是 4 的倍数。未对齐的访问（即地址没有对齐时）可能无法按预期工作。

对于在功能丰富的操作系统上运行的用户程序，通常支持未对齐访问，但可能会很慢。在微控制器等设备上运行的嵌入式应用程序中，未对齐访问可能根本无法工作。

本模拟器支持未对齐的内存访问。

```emulator
    lui x10, %hi(test)
    addi x10, x10, %lo(test)

    lw x11, 0(x10)
    lw x12, 1(x10)
    lw x13, 3(x10)

    ebreak

test:
    .byte 1, 2, 3, 4, 5, 6, 7, 8
```

现在你可以尝试将一些基础的 C 代码翻译成 RISC-V 汇编了。不过目前还不用考虑函数。变量必须是全局的，或者放在寄存器中。我们还缺少什么呢……

## 内存映射 I/O

是时候来写 Hello World 了吗？我想是的……

为了不让计算机仅仅成为一个空间加热器，我们需要某种方式让它至少能够产生输出并接收输入。其他架构可能拥有专用的 I/O 指令，但 RISC-V 使用的是[内存映射 I/O]{x=term}（memory mapped I/O）。本质上，这意味着对特殊地址进行加载和存储可以与其他的[设备]{x=term}（devices）进行通信。它们的行为与普通内存不同，你只能使用受支持的宽度来访问它们。

我们这里有一个输出设备，位于地址 `0x1000_0000`。任何对它的 32 位写入都会将最低 8 位作为一个字节追加到输出面板的文本中。换句话说，对该地址进行 `sw` 写入就可以输出一个字节。

（输出面板使用 UTF-8 编码。）

```emulator
    lui x11, %hi(0x10000000)
    li x10, 0x48 # 'H'
    sw x10, 0(x11)
    li x10, 0x69 # 'i'
    sw x10, 0(x11)
    li x10, 0x21 # '!'
    sw x10, 0(x11)
    li x10, 0x0a # '\n'
    sw x10, 0(x11)
    ebreak
```

这已经很接近向全世界问好了。我们可以重构一下代码来使用循环，或者做其他修改……现在我们想一想，如何再往前迈出一步，将我们的代码组织成一些函数？

# 函数

我们已经知道如何调用函数并返回了。即 `jal` 调用函数，`ret` 返回。通常函数会接收参数，使用局部变量，并返回结果。既然 31 个通用寄存器之间没有真正的区别（因为它们就是“通用”的），我们大可以根据自己的喜好使用其中任何一个。不过通常来说，有一些标准的惯例需要遵守。

## 寄存器别名与调用约定

在这整个过程中，你可能已经注意到每个寄存器都列出了两个名字，而且在汇编中两者的作用完全相同。

```emulator
    li x10, 1
    li a0, 1
    ebreak
```

这些[寄存器别名]{x=term}（register aliases）是根据它们的用途命名的：

- [`s0` 到 `s11`]{x=regalias} 是*保存*（saved）寄存器
- [`t0` 到 `t6`]{x=regalias} 是*临时*（temporary）寄存器
- [`a0` 到 `a7`]{x=regalias} 是*参数*（argument）寄存器
- [`zero`]{x=regalias} 就是特殊的零寄存器
- [`ra`]{x=regalias} 是返回地址寄存器，正如我们所见，这是按惯例使用的
- [`sp`]{x=regalias} ... 我们稍后会讨论 `sp`
- （[`tp`]{x=regalias} 和 [`gp`]{x=regalias} 的用途超出了本文的讨论范围。）

（是的，它们……排布的顺序有些奇怪。其中的原因超出了本教程的范围。）

当你调用一个函数时，你会把最多八个参数依次放入参数寄存器 `a0`、`a1`、……、`a7` 中。然后使用 `jal` 或其他指令，这会将返回地址放入 `ra`，并跳转到函数。

在函数内部，如果想要使用[被调用者保存]{x=term}（call-saved）寄存器 `s0` 到 `s11`，则必须在函数开始时保存它们的值，并在返回之前恢复它们。而对于非被调用者保存寄存器 `a0` 到 `a7`、`t0` 到 `t6` 以及 `ra`，可以对其进行修改而无需恢复它们的值。

当被调用的函数执行完毕时，如前所述，它会恢复所有使用的被调用者保存寄存器，并跳转回返回地址，恢复调用处的代码执行。

这里有一个基础的例子：

```
int memcmp(const void *a, const void *b, size_t n)
```

参数 `a` 通过 `a0` 传递，`b` 通过 `a1` 传递，`n` 通过 `a2` 传递。返回值将存放在 `a0` 中。这里是一个实现和测试运行：

```emulator
    # memcmp(test1, test2, 4)

    lui a0, %hi(test1)
    addi a0, a0, %lo(test1)
    lui a1, %hi(test2)
    addi a1, a1, %lo(test2)
    li a2, 4
    jal memcmp
    ebreak

    # int memcmp(const void *a, const void *b, size_t n);
memcmp:
    add a3, a0, a2 # a3 = a + n
    li t0, 0

memcmp_loop:
    beq a0, a3, memcmp_done # 没有更多字节了

    lb t0, 0(a0)
    lb t1, 0(a1)
    sub t0, t0, t1  # t0 = *a - *b

    bne t0, zero, memcmp_done # 如果不同，完成

    addi a0, a0, 1  # a ++
    addi a1, a1, 1  # b ++

    j memcmp_loop

memcmp_done:
    mv a0, t0
    ret

test1:
    .byte 1, 2, 3, 4
test2:
    .byte 1, 2, 2, 4
```

这里有一个稍微更有条理的 “Hello World”，使用了一个 `puts` 函数：

```emulator
    lui a0, %hi(msg)
    addi a0, a0, %lo(msg)
    jal puts
    ebreak

    # void puts(const char *);
puts:
    lui t1, %hi(0x10000000)
puts_loop:
    lb t0, 0(a0)
    beq t0, zero, puts_done
    sw t0, 0(t1)
    addi a0, a0, 1
    j puts_loop

puts_done:
    ret

msg:
    .byte 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 0x77
    .byte 0x6f, 0x72, 0x6c, 0x64, 0x21, 0x0a, 0x00
```

## 栈

虽然我们现在可以编写一些非常基础的函数，但仍然存在几个问题：

- 你不能在一个函数内部调用另一个函数，因为如果这样做，`ra` 就会被覆盖，从而导致你无法再从外层函数返回了。
- 我们仍然不知道“保存”寄存器是如何工作的。

显然，这两者都需要以某种方式使用内存。我们可以通过以结构化的方式使用内存来一箭双雕：这就是[栈]{x=term}（stack）。

与其他一些架构不同，`sp` 寄存器其实并没有什么非常特殊的地方。但就像我们可以指定如何使用 `a0` 一样，关于如何使用 `sp`，我们也有一些约定：

- 该寄存器是被调用者保存的，这意味着当从函数返回时，`sp` 的值必须与进入函数时相同。
- `sp` *总是*指向被称为“栈”的内存区域中的某个位置，并且它*总是* 16 字节对齐的。

而对于栈本身：

- 在 RISC-V 上，栈向低地址方向增长，这意味着 `address >= sp` 的内存区域处于“栈中”，而 `address < sp` 则是栈可以增长的空闲空间。
- 代码可以通过减小 `sp` 来在栈上分配空间，通过增加 `sp` 来释放空间。当然，分配和释放必须正确平衡。
- 你只能自由使用你已经分配的空间。

举个例子。假设你有一个函数 `foo`，它只是调用了两次 `bar`：

```
void foo() {
    bar();
    bar();
}
```

在 `foo` 内部，它需要保存初始的 `ra`，以便稍后能够返回。尽管 `ra` 只占用 4 个字节，但 `sp` 在任何时候都需要 16 字节对齐，因此我们将其向上取整到 16 字节。通过将 `sp` 减去 16，我们分配了空间：

```
foo:
    addi sp, sp, -16
```

Now, in addition to all of the non call-saved registers, we have 16 bytes of
scratch space at `sp` through `sp + 15`. We can backup the value of `ra` here

```
    ...
    sw ra, 0(sp)
```

然后我们只需调用 `bar` 两次，这会覆盖 `ra`：

```
    ...
    jal bar
    jal bar
```

在函数结束时，我们只需要取回返回地址，释放栈空间，然后返回。虽然使用任何寄存器来保存返回地址都足够了，但既然它毕竟是备份的 `ra` 值，我们将其加载回 `ra` 中。

```
    ...
    lw ra, 0(sp)
    addi sp, sp, 16
    ret
```

你可以以类似的方式保存和恢复 `s`（记住，被调用者保存）寄存器。通常，最方便的管理方式是将需要在内部函数调用之间保留的值放入 `s` 寄存器，然后在函数开始处添加代码保存它们，并在函数结尾处添加代码恢复它们。

照例该来写个递归斐波那契数了！

```emulator
    li a0, 10
    jal fib
    ebreak

fib:
    li t0, 2

    # 如果 n < 2，则返回 n
    bge a0, t0, fib_large
    ret

fib_large:
    # 否则，n >= 2

    # 将数据保存到栈
    addi sp, sp, -16
    sw ra, 0(sp)
    sw s0, 4(sp)
    sw s1, 8(sp)

    mv s0, a0       # s0 = n
    addi a0, a0, -1 # a0 = n - 1

    jal fib
    mv s1, a0       # s1 = fib(n - 1)

    addi a0, s0, -2
    jal fib         # fib(n - 2)

    add a0, a0, s1

    # 从栈恢复数据并返回
    lw ra, 0(sp)
    lw s0, 4(sp)
    lw s1, 8(sp)
    addi sp, sp, 16
    ret
```

该算法应该相当直白：

```
fibonacci(n) {
    if (n < 2) { return n; }
    else { return fib(n - 1) + fib(n - 2); }
}
```

这里值得注意的是在函数开始处保存寄存器的相当对称的模式：

```
    addi sp, sp, -16
    sw ra, 0(sp)
    sw s0, 4(sp)
    sw s1, 8(sp)
```

以及在结尾处恢复它们：

```
    lw ra, 0(sp)
    lw s0, 4(sp)
    lw s1, 8(sp)
    addi sp, sp, 16
    ret
```

另外需要注意的是，`s` 寄存器只在较复杂的分支中被保存，而较简单的分支则直接返回。从调用约定的角度来看，这同样是可接受的。

（注意：在模拟器中，`sp` 寄存器被初始化为一个便于你用作栈的地址，这只是为了方便。）

# 间奏：数字标签

让我们回到这个例子：

```
    # void puts(const char *);
puts:
    lui t1, %hi(0x10000000)
puts_loop:
    lb t0, 0(a0)
    beq t0, zero, puts_done
    sw t0, 0(t1)
    addi a0, a0, 1
    j puts_loop

puts_done:
    ret
```

必须为每个位置命名成像 `puts_loop`、`puts_done` 这样的名字有点烦人。还有一种更简短的方法：[数字标签]{x=term}（numeric labels）。

数字标签是用十进制数字命名的标签。要引用数字标签，请使用数字加上表示“向前”（forward）的 `f` 后缀，或表示“向后”（backward）的 `b` 后缀，它将对应于分别向前或向后搜索时遇到的最近的同名数字标签。

因此，之前的 `puts` 例子可以重写为：

```
    # void puts(const char *);
puts:
    lui t1, %hi(0x10000000)
1:
    lb t0, 0(a0)
    beq t0, zero, 2f
    sw t0, 0(t1)
    addi a0, a0, 1
    j 1b

2:
    ret
```

是的，我也不太喜欢这个语法，但这就是我们目前所拥有的。

# 位置无关

还记得我们很久以前提到的那个奇特指令 `auipc` 吗？

我不知道你的经历是怎样的，但我第一次看到 RISC-V 反汇编时，这就是最吸引我注意的指令。而这个记忆一直伴随着我。它在真实的 RISC-V 程序中相当常见，不知为何，我一直对你隐瞒到了现在。如果你悄悄看一下下一节的标题，你就会发现我们在没有 `auipc` 的情况下走了多远。

那么它是做什么的呢？

[`auipc`]{x=insn}（“添加高位立即数到 pc”，add upper immediate to pc）指令与 `lui` 非常相似。与将 `rd` 设置为 `imm20 << 12` 不同，它将 `rd` 设置为 `pc + (imm20 << 12)`，其中 `pc` 是 `auipc` 指令本身的地址。

```
auipc rd, imm20
```

它的工作方式与 `lui` 非常相似。你可以将它们视为一对：`lui` 的“基准”是 `0`，而 `auipc` 的“基准”是 `auipc` 指令本身的地址。因此这段代码：

```
start:
    lui a0, 3
    addi a0, a0, 4
```

会给你 `0x3004`，而这段代码：

```
start:
    auipc a0, 3
    addi a0, a0, 4
```

则会给你 `start + 0x3004`。

为什么需要这个？在现代系统上，通常希望机器码能够在地址空间中移动。例如，共享库（即动态链接库）可以加载到任何程序中的任何地址。如果机器码不需要每次都被打补丁（重定位），那将非常有帮助。这被称为[位置无关代码]{x=term}（[PIC]{x=term}）。

一些指令已经表现出了位置无关性。例如，正如我们之前讨论将 `lui` 和 `jalr` 结合使用时所提到的，分支指令和 `jal` 被编码成 32 位指令字（与所有 RV32I 指令一样），因此它们不可能编码每个可能的地址。相反，跳转目标是 `pc` 加上某些偏移量（这里的 `pc` 与之前一样，是指跳转/分支指令本身的地址），而偏移量本身被编码在指令中。

你可以看到这是三条跳转到自身的不同的指令。由于在每种情况下偏移量都是 `0`，因此编码是相同的。使用“导出”按钮自己去看看吧。

```emulator
    ebreak

test1:
    j test1

test2:
    j test2

test3:
    j test3
```

`auipc` 指令允许非常灵活的位置无关性。你可以根据代码所在的地址进行任意计算。镜像 `lui` 的立即数位操作数意味着它非常适合双指令对，就像 `lui` 一样。这类“`pc` 加上某些内容”的计算被称为[pc 相对寻址]{x=term}（pc-relative addressing）。

让汇编器为 pc 相对寻址生成立即数值的语法有点晦涩，但请听我解释：

```emulator
1:
    auipc a0, %pcrel_hi(foo)
    addi a0, a0, %pcrel_lo(1b)
    ebreak

foo:
    .word 0x12345
```

类似于 `%hi()` 和 `%lo()`，[`%pcrel_hi()`]{x=rel} 和 [`%pcrel_lo()`]{x=rel} 可以给出 pc 相对寻址所需的立即数。你将想要访问的标签传递给 `%pcrel_hi()`，但将 *`auipc` 指令本身的标签* 传递给 `%pcrel_lo()`。

与 `%lo()` 不同，我们需要 `auipc` 指令本身的地址来计算立即数值，这就是为什么需要将标签传递给它。你不需要再次写 `foo`，因为汇编器会查看 `auipc` 指令并知道它是为 `foo` 服务。

如果你讨厌这样写，也可以使用便利的伪指令 [`la`]{x=insn}：

```
la rd, label
```

就像 `lui` + `jalr` 组合一样，在位置无关代码中，`auipc` + `jalr` 可用于跳转到超出单个 `jal` 能到达的更远位置。

一个非常常见的例子是调用一个可能无法通过 `jal` 触及的函数。你可以为此使用伪指令 [`call`]{x=insn}。

```
call label
```

它展开为：

```
1:
    auipc ra, %pcrel_hi(label)
    jalr ra, %pcrel_lo(1b)(ra)
```

注意 `ra` 是如何用作存放中间结果的临时寄存器的，它会立即被 `jalr` 覆盖。

事实上，在使用标签时，确实没有任何理由更偏好 `lui` 而非 `auipc`。这就是为什么如果你反编译一个真实的 RISC-V 程序，你会看到它无处不在，即使是在非位置无关代码中。

现在是休息一下的好时机，因为我们正准备进入……

# 特权架构基础

我们将编写一个*极其*简单的操作系统。

## 特权级别

操作系统的任务之一是控制程序能做什么和不能做什么。在 RISC-V 上，这种最基础的控制是通过[特权级]{x=term}（privilege levels）实现的。RISC-V 定义了……姑且说是几种特权级别，但我们在这里只使用两种：

- “[机器模式]{x=term}”（Machine），数值为 3
- “[用户模式]{x=term}”（User），数值为 0

特权级别数值越低，其特权就越低。高特权级别通常将低特权级别视为完全不可靠和不可信任的，必须保护自身不受低特权级恶意软件和错误的影响。

（不过，我们不会讨论实现这种完全隔离的所有功能，而且你所看到的模拟器本身也不具备足够的功能。因此，我们即将构建的操作系统在很多方面都会处于不设防的状态。）

特权级别有时简称为“[模式]{x=term}”（modes）。如果这还不够短，我们可以缩短特权级的名称本身，最终得到 [M-mode]{x=term} 和 [U-mode]{x=term}。所有这些指代特权级别的方式都是可以互换的。

当 RISC-V 机器启动时（这被称为“[复位]{x=term}”，reset），它从机器模式（M-mode）开始执行。在只实现了机器模式和用户模式的典型“嵌入式”系统上，执行从闪存（flash memory）中读取的初始化代码开始。这段代码既可以自己完成所需的操作，也可以是一个管理一些任务的操作系统，每个任务都在用户模式下执行。

前一种设计用于较简单的程序，类似于我们目前看到 and 运行的程序。后一种设计则更为复杂。我们很快就会看到如何实现这一点的基础知识。

## 控制与状态寄存器（CSR）

[控制与状态寄存器]{x=term}（[CSRs]{x=term}）处理各种在某种意义上“特殊”的功能。我也没有更好的解释来定义什么是“特殊”。

有六条指令可用于操作 CSR。

```
csrrw rd, csr, rs1
csrrs rd, csr, rs1
csrrc rd, csr, rs1
csrrwi rd, csr, uimm5
csrrsi rd, csr, uimm5
csrrci rd, csr, uimm5
```

要在这些指令中引用 CSR，请在汇编代码中使用其名称。我们稍后会讲到这些。

它的工作机制是这样的：每条指令都*原子地*读取 CSR 的旧值，并根据旧值和最后一个操作数进行的某些操作写入新值。可能的操作包括：

- [`csrrw`]{x=insn}（“CSR 读写”，CSR read write）：`{ csr = rs1; rd = csr_old; }`
- [`csrrs`]{x=insn}（“CSR 读置位”，CSR read set）：`{ csr = csr | rs1; rd = csr_old; }`
- [`csrrc`]{x=insn}（“CSR 读清除”，CSR read clear）：`{ csr = csr & ~rs1; rd = csr_old; }`

其中 `&`、`|`、`~` 分别是按位“与”、“或”、“非”。

具体来说，注意 `rd` 和 `rs1` 可以是同一个寄存器。例如，此指令会交换 `a0` 和 `mscratch` 的值：

```
csrrw a0, mscratch, a0
```

对于“立即数”变体，它们接收一个“无符号”/零扩展的 5 位立即数值作为第二个操作数，即 0 到 31（含）的立即数。在汇编语法描述中，这使用 `uimm5` 表示。除此之外，操作完全相同：

- [`csrrwi`]{x=insn}（“CSR 读写立即数”，CSR read write immediate）：`{ csr = uimm5; rd = csr_old; }`
- [`csrrsi`]{x=insn}（“CSR 读置位立即数”，CSR read set immediate）：`{ csr = csr | uimm5; rd = csr_old; }`
- [`csrrci`]{x=insn}（“CSR 读清除立即数”，CSR read clear immediate）：`{ csr = csr & ~uimm5; rd = csr_old; }`

这些指令的完整功能是为操作 CSR 中的位域（bit fields）而设计的，但在本教程中我们不会过多涉及。尽管如此，这种正交的设计应该相当直观易记。

CSR 和 CSR 中的字段的行为与通用寄存器不同：它们有些是可读写的，有些是只读的。此外，无效值具有特殊行为。随着我们介绍各个 CSR 本身，我们会涉及到更多细节，但你可能已经注意到，我们似乎没有只读 CSR 的指令。只读访问是通过指令编码中的特殊情况实现的：

- 如果 `rs1` 是 `x0`（又名 `zero`），`csrrs` 和 `csrrc` 不会写入 CSR。（注意，仅 `rs1` 的值等于 0 是不够的。）
- 如果 `uimm5` 为 0，`csrrsi` 和 `csrrci` 不会写入 CSR。

顺便提一句：

- 如果 `rd` 是 `x0`（又名 `zero`），`csrrw` 和 `csrrwi` 不会读取 CSR。（注意，写入 `x0` 本来就没有效果，因为它是常数 0。）

（标准的 RISC-V CSR 没有什么是只写的，或者在读取时有副作用。）

为了方便起见，提供了伪指令 [`csrr`]{x=insn}（“CSR 读”，CSR read）和 [`csrw`]{x=insn}（“CSR 写”，CSR write）。`csrw csr, rs1` 展开为 `csrrw x0, csr, rs1`。同时，`csrr rd, csr` 具体展开为 `csrrs rd, csr, x0`，以便我们可以统一编码。

```
csrw csr, rs1
csrr rd, csr
```

如果你向下滚动过寄存器视图，可能已经见过这些 CSR 了。是的，我们终于要接触它们了。

## 计数器

CSR 的一个例子是[计数器]{x=term}。两个基本的只读计数器是 [`cycle`]{x=csr} 和 [`instret`]{x=csr}。这些计数器，正如其名，用于*计数*“时钟周期数”（cycles）和“完成的指令数”（instructions retired）。“Retired”是一个技术术语，基本上意味着“成功完成”。

由于 32 位计数器会非常快地溢出，在 RV32 上，计数器有“高位”对应版本：[`cycleh`]{x=csr} 和 [`instreth`]{x=csr}。因此，例如完整的周期计数器是 64 位的，低 32 位在 CSR `cycle` 中，高 32 位在 CSR `cycleh` 中。

在模拟器运行时，在寄存器视图面板上向下滚动，在最底部你会看到这些计数器的值。为了方便起见，它们是结合显示在一起的，例如，`cycle = 0x11223344_55667788` 意味着 `cycleh` 是 `0x11223344`，而 `cycle` 是 `0x55667788`。

在真实硬件上，`cycle` 与时钟周期挂钩。在这个模拟器中，每次按下“单步”，都会算作一个周期。当你按下“运行”并开始运行时，周期会定期增加。

让我们看一个非常简单的例子：

```emulator
    addi a0, a0, 1
    addi a0, a0, 1
    addi a0, a0, 1
    ebreak
```

这个程序停止需要 4 个周期，但 `instret` 最终只有 3，因为最后的 `ebreak` 指令实际上从未完成。

（不要混淆“retired”和“retried”这两个词。）

程序可以读取自己的计数器。例如，这个有趣的小程序会一直循环，直到周期计数超过 1000（假设低 32 位在程序有时间反应之前没有溢出）：

```emulator
    li t1, 1000
loop:
    csrr t0, cycle
    blt t0, t1, loop

    ebreak
```

## 当前特权级别

严格来说，`cycle` 和 `instret` 不属于特权架构。真正的乐趣从*现在*开始。

模拟器将当前的特权级显示为 `(priv)`。它被放在括号中是为了提醒你一个非常重要的事实：

*没有用于读取当前特权级别的 CSR。*

通常，RISC-V 程序无法获知它处于哪个特权级别。这是 [Popek 与 Goldberg 虚拟化需求][wp-p-g-conditions]能够正常工作的必要条件，因为如果能在低于最高特权级的情况下读取当前特权级，那将是一条“敏感的”但“非特权级”的指令。

[wp-p-g-conditions]: https://en.wikipedia.org/wiki/Popek_and_Goldberg_virtualization_requirements

如果你在为某个特权级别编写程序，你应该简单地假设它已经被正确地运行在该特权级别下。

# 异常

## 异常入口

操作系统的基本工作方式之一就是通过处理异常。一般而言，当特定的指令出现问题且执行无法继续时，就会发生[异常]{x=term}。例如，由于 `cycle` 是只读 CSR，尝试写入它就是一条非法指令：

```emulator
    csrw cycle, x0
```

由于我们在程序中没有设置异常处理，因此我们必须在模拟器中手动检查发生了什么。确实发生了很多事情：

首先，这条消息告诉你发生了异常：

```
[ 异常: 非法指令 (2) | tval = 0xc0001073, epc = 0x4000000c ]
```

同样的信息现在也记录在 CSR 中，如下所示：

- `mcause`（“M模式陷阱原因”，M-mode trap cause）：异常的类型。
- `mepc`（“M模式异常 pc”，M-mode exception pc）：导致异常的指令地址。
- `mtval`（“M模式陷阱值”，M-mode trap value）：关于异常的额外信息。
- `mstatus`（“M模式状态”，M-mode status）：它被设置为 `0x00001800`。中间的两位，即 `mstatus[12:11]`（在 C 语言语法中为 `(mstatus >> 11) & 0x3`）是 `mstatus.MPP`（“M模式前一特权级别”，M-mode previous privilege level）字段，其中包含 3，意味着异常发生在机器模式（M-mode）运行时。

当异常发生时，除了将异常信息记录在这些 CSR 字段中，`pc` 会被设置为 `mtvec`，即设置好的异常处理程序（handler）的地址。让我们自己编写一个极其简单的异常处理程序，它只是打印一条消息并停止模拟器，然后看看处理过程是如何运作的：

```emulator
    la t0, handler
    csrw mtvec, t0

    # 现在导致一个异常
    csrw cycle, x0

    # 主程序的其余部分永远不会被执行
    addi a0, a0, 1
    addi a0, a0, 1

handler:
    la a0, msg
    call puts
    ebreak

msg:
    .byte 0x4f, 0x68, 0x20, 0x6e, 0x6f, 0x21, 0x0a, 0x00

    # void puts(const char *);
puts:
    lui t1, %hi(0x10000000)
1:
    lb t0, 0(a0)
    beq t0, zero, 2f
    sw t0, 0(t1)
    addi a0, a0, 1
    j 1b

2:
    ret
```

是的，出错时它只是打印 `Oh no!`。这仅仅是婴儿学步般的一小步……

“异常时暂停”和“异常时打印”复选框分别控制当发生异常时模拟器是否应当暂停或打印消息。如果你希望程序中设置的异常处理程序不受干扰地运行，可以取消勾选这些复选框。

（另一种会导致跳转到 `mtvec` 的情况是[中断]{x=term}。不过，本模拟器中不存在该功能。这两类情况统称为[陷阱]{x=term}，traps。）

## 异常原因

以下是此模拟器中可能发生的异常及其对应的数字代码：

| 异常码 | 描述 |
|:-----|:---|
| 0     | 指令地址未对齐 |
| 1     | 指令访问错误 |
| 2     | 非法指令 |
| 3     | 断点 |
| 5     | 读取访问错误 |
| 7     | 写入访问错误 |
| 8     | 用户模式环境调用 |
| 11    | 机器模式环境调用 |

“指令地址未对齐”发生在尝试跳转到没有 4 字节对齐的指令时。异常发生在跳转或分支指令处，而不是目标地址处。

“读取访问错误”和“写入访问错误”发生在访问无效的内存地址，或者以无效的方式访问内存地址时。

（“AMO”代表“原子内存操作”，我们不会讨论，且模拟器中也不支持此功能。）

“非法指令”不仅在显而易见地执行了无效指令时发生，在以无效方式访问 CSR 或从过低的特权级别访问 CSR 时也会发生。

“断点”、“用户模式环境调用”和“机器模式环境调用”将在接下来的章节中进行解释。

## 异常返回

[`mret`]{x=insn}（“M模式返回”，M-mode return）指令执行异常发生时部分操作的逆操作。准确地说，发生的操作是：

- 当前特权级别被设置回 `mstatus.MPP`
- `mstatus.MPP` 被设置为 0
- `pc` 被设置为 `mepc`

（你可以把特权模式位想象成在一条链中移动 `0 -> MPP -> priv`。更准确地说，`mstatus.MPP` 会被设置为最低支持的特权模式，因为它不应该包含不支持的模式。）

`mret` 不需要操作数，因此汇编语法非常简单：

```
mret
```

如果我们在发生异常后执行 `mret`，我们就会回到重新尝试执行同一条指令。这在一些功能更丰富的实现中很有用，例如在处理完缺页异常（page fault）后，正确的做法是重新尝试执行出错的指令。

不过，`mstatus` 和 `mepc` 也是可写的。这让我们在使用 `mret` 时拥有了更多的灵活性。类比一下，同一条 `jr` 指令（实际上是 `jalr` 指令）既可以用于从调用中返回，也可以用于跳转到任何地址。类似地，`mret` 不仅可以让我们从异常中返回，还可以让我们跳转到任何地址*并*切换到任何特权级别。

# 处理用户模式

## 进入用户模式

实际上，尽管 `mret` 被命名为“返回”，但它是降低特权级别以*进入*用户模式的唯一途径。这里有一个进入用户模式 the 例子，其中包含一个做坏事的用户模式程序：

```emulator
    la t0, handler
    csrw mtvec, t0

    lui t0, %hi(0x1800)
    addi t0, t0, %lo(0x1800)

    # 将 MPP 清零
    csrrc zero, mstatus, t0

    la t0, user_entry
    csrw mepc, t0
    mret

handler:
    ebreak # 仅停止模拟器

user_entry:
    # 尝试访问 M-mode 下的 CSR
    csrr a0, mstatus
```

正如你所见，进入用户模式（User mode）后，所有用于异常处理的 CSR 都会变得完全不可访问，甚至无法读取。与写入只读 CSR 类似，在没有权限的情况下访问 CSR 也会导致非法指令异常。

此外，当发生异常时，我们会返回到机器模式（Machine mode），因此异常处理程序会在机器模式下运行。在这里，处理程序除了停止模拟器之外什么也没做。

## 故意触发异常

有时，程序可能希望故意触发异常。有几种定义明确的方法可以做到这一点：

- 伪指令 [`unimp`]{x=insn} 的编码与 `csrrw zero, cycle, zero` 相同，它是标准的 RV32I 非法指令。它会触发“非法指令”异常。
- 指令 [`ebreak`]{x=insn} 会触发“断点”异常。
- 指令 [`ecall`]{x=insn} 在用户模式下执行时会触发“用户模式环境调用”异常，在机器模式下执行时会触发“机器模式环境调用”异常。

在此处尝试运行这些异常：

```emulator
    la t0, handler
    csrw mtvec, t0

    lui t0, %hi(0x1800)
    addi t0, t0, %lo(0x1800)

    # 将 MPP 清零
    csrrc zero, mstatus, t0

    la t0, user_entry
    csrw mepc, t0
    mret

handler:
    ebreak # 仅停止模拟器

user_entry:
    ebreak
    # ecall
    # unimp
```

顾名思义，`ebreak` 用于调试断点。在这个模拟器中，作为一个特例，机器模式下的 `ebreak` 会停止模拟器。你可以将模拟器想象成一个调试器，而调试器捕获了这个断点。

`unimp` 可以用于在检测到某些不可恢复的错误时故意使程序崩溃。

同时，`ecall` 用于实现系统调用。“用户模式环境调用”具有独立的异常原因代码，以便专门检查并处理这种情况。

## 保存与恢复所有寄存器

在陷阱（trap）处理程序中，你绝不会希望信任或打扰发生陷阱的代码中的*任何*通用寄存器，除非你是有意为之，例如为了从系统调用中返回一个值。因此，在执行任何其他操作之前，你需要将所有寄存器保存到内存中。然而，访问内存本身就需要使用通用寄存器。

[`mscratch`]{x=csr}（“M模式暂存”，M-mode scratch）CSR 可以解决这个问题。该寄存器与所有其他寄存器不同，它没有任何特殊功能。它可以保存任意 32 位值。然而，与所有其他 M-mode CSR 一样，它只能在机器模式下访问。用户模式代码无法更改它的值。

因此，举例来说，你可以在切换到用户模式之前将操作系统的栈指针存放在 `mscratch` 中，它在用户模式下将保持原样不被触动。在处理程序的顶部，使用 `csrrw sp, mscratch, sp` 将用户栈指针交换为操作系统的栈指针。

```
handler:
    csrrw sp, mscratch, sp
    # 保存除 sp 外的寄存器
    csrr t0, mscratch
    # t0 = 用户 sp，将其保存
    # 保存 user pc
    ...
```

并且，要恢复它们：

```
    lw t0, ... # 加载用户 pc
    csrw mepc, t0
    lw t0, ... # 加载用户 sp
    csrw mscratch, t0
    # 恢复除 sp 外的寄存器
    csrrw sp, mscratch, sp
    mret
```

我们将在下一节中看到完整的代码。

# 编写一个极其简单的操作系统

## 设计

我们拥有了足够的知识来编写一个极其简单的操作系统。它将支持以下功能：

- 系统调用：在 `ecall` 发生时，操作系统会根据寄存器的值执行相应的操作：
  - `a7 = 1`：putchar：`a0` 是要写入的字节，之后返回到 `ecall` 后面的那条指令。
  - `a7 = 2`：exit：停止模拟器。
- 异常处理：在发生任何其他异常时，打印错误消息并退出。

我们将异常处理设计如下：

- 在 M-mode 的大部分时间里，`mscratch` 值为 0。
- 处于 U-mode 时，`mscratch` 指向操作系统的栈指针。
- 在陷阱处理程序中，如果 `mscratch` 为 0，说明异常来自 M-mode，我们无法处理，因此报告致命异常。
- 如果它确实来自 U-mode，在栈上分配 128 字节并保存 U-mode 寄存器，然后调用 `trap_main`，它处理异常并可能操作保存的寄存器。在我们返回后，这些更改会反映在 U-mode 状态中。
- 在 `trap_main` 之后，我们从内存中恢复寄存器，从栈中释放空间，并返回到 U-mode，如上一节所述。

保存寄存器的结构非常简单：

```
struct regs {
  unsigned long pc;
  unsigned long ra; // x1
  unsigned long sp; // x2
  ...
  unsigned long t6; // x31
};
```

基本上，你可以把它想象成一个数组，其中第 0 个元素是 `pc`，第 1 到 31 个元素是寄存器 x1 到 x31。

在 `trap_main` 内部，我们检查 `mcause` 以确认它是否为系统调用。如果是，我们根据 `a7` 的值进行分派。如果不是，我们报告来自 U-mode 的异常。

在开始时，我们只需在栈上初始化 `struct regs` 结构，在其中初始化用户的 `sp` 和 `pc`，并跳转到处理返回 U-mode 的相同代码处。

## 代码

这里是汇编代码，用户模式（User mode）的代码在最下方。为了方便起见，你可能需要取消勾选“异常时暂停”和“异常时打印”。

如果无法完全理解这段代码，请不要气馁。毕竟，这已经是一个相当完整的操作系统内核进入和退出的实现了。其实，我在这里向你展示的最重要的一点是：这是完全可行的。

```emulator
    # 为操作系统栈预留 256 字节
    # 用户栈从低 256 字节处开始
    addi t2, sp, -256

    la t0, handler
    csrw mtvec, t0

    # 准备 struct regs
    addi sp, sp, -128

    mv a0, sp # struct regs *

    # 设置用户 pc 为 user_entry
    la t0, user_entry
    sw t0, 0(a0)

    # 设置用户 sp
    sw t2, 8(a0)

    j enter_user

    # void trap_main(struct regs *regs)
trap_main:
    # 根据调用规范保存寄存器
    addi sp, sp, -16
    sw s0, (sp)
    sw ra, 4(sp)

    mv s0, a0
    csrr a1, mcause
    li t1, 8 # "Environment call from User mode"
    bne a1, t1, do_bad_exception # 不是 ecall，这很糟糕

    # 用来自 ecall 的参数调用 do_syscall

    lw a0, 40(s0)
    lw a1, 44(s0)
    lw a2, 48(s0)
    lw a3, 52(s0)
    lw a4, 56(s0)
    lw a5, 60(s0)
    lw a6, 64(s0)
    lw a7, 68(s0)
    call do_syscall

    sw a0, 40(s0)   # 设置用户 a0 的返回值

    # 将用户的 pc 增加 4
    # 跳过 ecall 指令
    lw t0, 0(s0)
    addi t0, t0, 4
    sw t0, 0(s0)

    # 根据调用规范恢复寄存器
    lw s0, (sp)
    lw ra, 4(sp)
    addi sp, sp, 16
    ret

    # a0 = 参数0, a7 = 系统调用号
do_syscall:
    # 根据系统调用号进行分派
    li t0, 1
    beq a7, t0, sys_putchar
    li t0, 2
    beq a7, t0, sys_exit

    # 错误的系统调用
    li a0, -1
    ret

    # int sys_putchar(char c)
sys_putchar:
    # 根据调用规范保存寄存器
    addi sp, sp, -16
    sw s0, (sp)
    sw ra, 4(sp)

    call kputchar
    li a0, 0

    # 根据调用规范恢复寄存器
    lw s0, (sp)
    lw ra, 4(sp)
    addi sp, sp, 16
    ret

    # [[noreturn]] void sys_exit()
sys_exit:
    # 仅停止模拟器
    ebreak

    # [[noreturn]] void do_bad_exception(struct regs *regs, long cause)
    # 打印有关异常的 U 模式异常消息，然后停止
do_bad_exception:
    mv s0, a1

    # 等同于 printf("Exception 0x%x", cause);
    la a0, msg_exception
    call kputs

    mv a0, s0
    la t0, hex_chars
    add t0, t0, a0
    lbu a0, (t0)
    call kputchar

    li a0, 0xa # '\n'
    call kputchar

    # 停止模拟器
    ebreak

fatal:
    # 打印致命异常消息，然后停止
    la a0, msg_fatal
    call kputs
    ebreak

msg_exception:
    # "Exception 0x"
    .byte 0x45, 0x78, 0x63, 0x65, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x20, 0x30, 0x78, 0x00

msg_fatal:
    # "Fatal exception\n"
    .byte 0x46, 0x61, 0x74, 0x61, 0x6c, 0x20, 0x65, 0x78, 0x63, 0x65, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x0a, 0x00

hex_chars:
    # "0123456789abcdef"
    .byte 0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x00

    .byte 0x00 # 对齐填充
    # 否则，下一条指令将无法对齐

    # void kputs(const char *);
    # 通过直接访问 MMIO 打印字符串
kputs:
    lui t1, %hi(0x10000000)
    lb t0, 0(a0)
    beq t0, zero, 2f
    sw t0, 0(t1)
    addi a0, a0, 1
    j 1b
2:
    ret

    # void kputchar(char);
    # 通过直接访问 MMIO 打印字节
kputchar:
    lui t1, %hi(0x10000000)
    sw a0, (t1)
    ret

    # 核心异常处理程序
handler:
    csrrw sp, mscratch, sp

    # 如果 mscratch 为 0，说明是来自 M 模式的异常
    # 无法处理该异常，这属于致命错误
    beq sp, zero, fatal

    # 保存所有寄存器
    addi sp, sp, -128
    sw x1, 4(sp)
    # x2/sp 单独处理
    sw x3, 12(sp)
    sw x4, 16(sp)
    sw x5, 20(sp)
    sw x6, 24(sp)
    sw x7, 28(sp)
    sw x8, 32(sp)
    sw x9, 36(sp)
    sw x10, 40(sp)
    sw x11, 44(sp)
    sw x12, 48(sp)
    sw x13, 52(sp)
    sw x14, 56(sp)
    sw x15, 60(sp)
    sw x16, 64(sp)
    sw x17, 68(sp)
    sw x18, 72(sp)
    sw x19, 76(sp)
    sw x20, 80(sp)
    sw x21, 84(sp)
    sw x22, 88(sp)
    sw x23, 92(sp)
    sw x24, 96(sp)
    sw x25, 100(sp)
    sw x26, 104(sp)
    sw x27, 108(sp)
    sw x28, 112(sp)
    sw x29, 116(sp)
    sw x30, 120(sp)
    sw x31, 124(sp)

    # 保存用户 sp，并在 M 模式下将 mscratch 设置为 0
    csrrw t0, mscratch, zero
    sw t0, 8(sp)

    # 保存用户 pc
    csrr t0, mepc
    sw t0, 0(sp)

    mv a0, sp
    call trap_main
    # ... 在 trap_main 之后继续往下执行 ...
enter_user:
    # 设置 mstatus.MPP = User
    lui t0, %hi(0x1800)
    addi t0, t0, %lo(0x1800)
    csrrc zero, mstatus, t0

    # 设置 mepc = 用户 pc
    # 实际将通过 mret 进行跳转
    lw t0, 0(sp)
    csrw mepc, t0

    # 暂时设置 mscratch = 用户 sp
    # 将在 mret 之前进行交换
    lw t0, 8(sp)
    csrw mscratch, t0

    # 从栈中恢复其他寄存器
    lw x1, 4(sp)
    # x2/sp 单独处理
    lw x3, 12(sp)
    lw x4, 16(sp)
    lw x5, 20(sp)
    lw x6, 24(sp)
    lw x7, 28(sp)
    lw x8, 32(sp)
    lw x9, 36(sp)
    lw x10, 40(sp)
    lw x11, 44(sp)
    lw x12, 48(sp)
    lw x13, 52(sp)
    lw x14, 56(sp)
    lw x15, 60(sp)
    lw x16, 64(sp)
    lw x17, 68(sp)
    lw x18, 72(sp)
    lw x19, 76(sp)
    lw x20, 80(sp)
    lw x21, 84(sp)
    lw x22, 88(sp)
    lw x23, 92(sp)
    lw x24, 96(sp)
    lw x25, 100(sp)
    lw x26, 104(sp)
    lw x27, 108(sp)
    lw x28, 112(sp)
    lw x29, 116(sp)
    lw x30, 120(sp)
    lw x31, 124(sp)
    addi sp, sp, 128

    # 实际恢复 sp
    csrrw sp, mscratch, sp
    mret    # 该去用户模式了！

################

user_entry:
    la a0, msg_hello
    call puts
    call exit

    # void puts(const char *);
    # 使用系统调用打印字符串
puts:
    addi sp, sp, -16
    sw s0, (sp)
    sw ra, 4(sp)

    mv s0, a0
1:
    lb a0, 0(s0)
    beq a0, zero, 2f
    call putchar
    addi s0, s0, 1
    j 1b
2:

    lw s0, (sp)
    lw ra, 4(sp)
    addi sp, sp, 16
    ret

    # void putchar(const char *);
    # 使用系统调用打印字节
putchar:
    li a7, 1
    ecall
    ret

    # [[noreturn]] void exit();
exit:
    li a7, 2
    ecall
    # 理论上不应该返回，只是为了安全起见
    unimp

msg_hello:
    .byte 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21, 0x0a, 0x00
```

<!-- 以下内容暂未翻译，在后续计划中逐步补全 -->
