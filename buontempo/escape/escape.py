import argparse
import inspect
import pickle
import random
import turtle

from buontempo.escape.hello_turtle import draw_bag
from buontempo.utils import Data


def escaped(position: turtle.Vec2D) -> bool:
    x = int(position[0])
    y = int(position[1])
    return x < -35 or x > 35 or y < -35 or y > 35


def draw_line():
    angle = 0
    step = 5
    t = turtle.Turtle()
    while not escaped(t.position()):
        t.left(angle)
        t.forward(step)


def store_position_data(pos_list: Data, t: turtle.Turtle) -> None:
    position = t.position()
    pos_list.append([position[0], position[1], escaped(position)])


def draw_square(t: turtle.Turtle, size: int):
    pos_list = []
    for _ in range(4):
        t.forward(size)
        t.left(90)
        store_position_data(pos_list, t)
    return pos_list


def draw_squares(number: int) -> Data:
    t = turtle.Turtle()
    pos_list = []
    for i in range(1, number + 1):
        t.penup()
        t.goto(-i, -i)
        t.pendown()
        pos_list.extend(draw_square(t, i * 2))
    return pos_list


def draw_squares_until_escaped(n: int) -> None:
    pos_list = draw_squares(n)
    with open("data_square", "wb") as f:
        pickle.dump(pos_list, f)


def draw_triangles(number: int) -> None:
    t = turtle.Turtle()
    for i in range(1, number + 1):
        t.forward(i * 10)
        t.right(120)


def draw_spirals_until_escaped() -> Data:
    t = turtle.Turtle()
    t.penup()
    t.left(random.randint(0, 360))
    t.pendown()

    i = 0
    turn = 360 / random.randint(1, 10)
    pos_list = []
    store_position_data(pos_list, t)
    while not escaped(t.position()):
        i += 1
        t.forward(i * 5)
        t.right(turn)
        store_position_data(pos_list, t)

    return pos_list


def draw_random_spirangles() -> None:
    pos_list = []
    for _ in range(10):
        pos_list.extend(draw_spirals_until_escaped())

    with open("data_rand", "wb") as f:
        pickle.dump(pos_list, f)


if __name__ == '__main__':
    fns = {"line": draw_line,
           "squares": draw_squares_until_escaped,
           "triangles": draw_triangles,
           "spirangles": draw_random_spirangles}

    parser = argparse.ArgumentParser()
    parser.add_argument("-f", "--function", choices=fns, help=f"One of {', '.join(fns.keys())}")
    parser.add_argument("-n", "--number", default=50, type=int, help="How many?")
    args = parser.parse_args()

    try:
        fn = fns[args.function]
        turtle.setworldcoordinates(-70., -70., 70., 70.)
        draw_bag()
        turtle.hideturtle()
        if len(inspect.getfullargspec(fn).args) == 1:
            fn(args.number)
        else:
            fn()
        turtle.mainloop()
    except KeyError:
        parser.print_help()
