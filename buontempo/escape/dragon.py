from turtle import lt, rt, fd, mainloop


def X(n: int) -> None:
    if n > 0:
        L("X+YF+", n)


def Y(n: int) -> None:
    if n > 0:
        L("-FX-Y", n)


def L(s, n) -> None:
    for c in s:
        if c == '-':
            lt(90)
        elif c == '+':
            rt(90)
        elif c == 'X':
            X(n - 1)
        elif c == 'Y':
            Y(n - 1)
        elif c == 'F':
            fd(12)


if __name__ == '__main__':
    X(10)
    mainloop()
