import math
from itertools import accumulate
import random
from matplotlib import pyplot as plt
import matplotlib


def random_tries(items: int) -> [(float, float)]:
    return [(random.uniform(0.1, math.pi), random.uniform(2, 20)) for _ in range(items)]


def selection(generation, width: float) -> [float]:
    results = [hit_coordinate(theta, v, width)[1] for theta, v in generation]
    return cumulative_probabilites(results)


def hit_coordinate(theta: float, v: float, width: float) -> (float, float):
    x = 0.5 * width
    x_hit = width
    if theta > math.pi / 2:
        x = -x
        x_hit = 0
    t = x / (v * math.cos(theta))
    y = v * t * math.sin(theta) - 0.5 * 9.81 * t * t
    if y < 0:
        y = 0.
    return x_hit, y


def escaped(theta: float, v: float, width: float, height: float) -> bool:
    x_hit, y_hit = hit_coordinate(theta, v, width)
    return (x_hit == 0 or x_hit == width) and y_hit > height


def cumulative_probabilites(results: [float]) -> [float]:
    return list(accumulate(results))


def choose(choices: [float]) -> int:
    p = random.uniform(0, choices[-1])
    for i in range(len(choices)):
        if choices[i] >= p:
            return i


def crossover(generation: [(float, float)], width: float) -> [(float, float)]:
    choices = selection(generation, width)
    next_generation = []
    for i in range(len(generation)):
        mum = generation[choose(choices)]
        dad = generation[choose(choices)]
        next_generation.append(breed(mum, dad))
    return next_generation


def breed(mum: (float, float), dad: (float, float)) -> (float, float):
    return mum[0], dad[1]


def mutate(generation: (float, float)) -> None:
    for i in range(len(generation) - 1):
        theta, v = generation[i]
        if random.random() < 0.1:
            new_theta = theta + random.uniform(-10, 10) * math.pi / 180
            if 0 < new_theta < 2 * math.pi:
                theta = new_theta
        if random.random() < 0.1:
            v *= random.uniform(0.9, 1.1)
        generation[i] = theta, v


def fire() -> None:
    epochs = 10
    items = 12
    height = 5.
    width = 10.

    generation = random_tries(items)
    generation0 = list(generation)  # save to contrast with last epoch

    for i in range(1, epochs):
        results = []
        generation = crossover(generation, width)
        mutate(generation)

    display_start_and_finish(generation0, generation, height, width)


def display(generation: [(float, float)], ax: plt.Axes, height: float, width: float) -> None:
    rect = plt.Rectangle((0, 0), width, height, facecolor='gray')
    ax.add_patch(rect)
    ax.set_xlabel('x')
    ax.set_ylabel('y')
    ax.set_xlim(-width, 2 * width)
    ax.set_ylim(0, 4 * height)
    free = 0
    result = launch(generation, height, width)
    for res, (theta, v) in zip(result, generation):
        x = [j[0] for j in res]
        y = [j[1] for j in res]
        if escaped(theta, v, width, height):
            ax.plot(x, y, 'ro-', linewidth=2.)
            free += 1
        else:
            ax.plot(x, y, 'bx-', linewidth=2.)
    print("Escaped", free)


def launch(generation: [(float, float)], height: float, width: float) -> [[(float, float)]]:
    results = []
    for theta, v in generation:
        x_hit, y_hit = hit_coordinate(theta, v, width)
        good = escaped(theta, v, width, height)
        result = [(width / 2., 0.0)]
        for i in range(1, 20):
            t = i * 0.2
            x = width / 2. + v * t * math.cos(theta)
            y = v * t * math.sin(theta) - 0.5 * 9.81 * t * t
            if y < 0:
                y = 0
            if not good and not (0 < x < width):
                result.append((x_hit, y_hit))
                break
            result.append((x, y))
        results.append(result)
    return results


def display_start_and_finish(generation0: [(float, float)], generation: [(float, float)],
                             height: float, width: float) -> None:
    matplotlib.rcParams.update({'font.size': 18})
    fig = plt.figure()
    ax0 = fig.add_subplot(2, 1, 1)
    ax0.set_title('Initial attempt')
    display(generation0, ax0, height, width)
    ax = fig.add_subplot(2, 1, 2)
    ax.set_title('Final attempt')
    display(generation, ax, height, width)
    plt.show()


if __name__ == '__main__':
    fire()
