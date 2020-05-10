import collections
import math
import operator
from typing import Union

from buontempo.utils import Data


def entropy(data: Data) -> float:

    def item_entropy(category: int) -> float:
        ratio = float(category) / len(data)
        return -1 * ratio * math.log(ratio, 2)

    frequency = collections.Counter([item[-1] for item in data])
    return sum(item_entropy(c) for c in frequency.values())


def best_feature_for_split(data: Data) -> int:
    baseline = entropy(data)

    def feature_entropy(f):
        def e(v):
            partitioned_data = [d for d in data if d[f] == v]
            proportion = float(len(partitioned_data)) / float(len(data))
            return proportion * entropy(partitioned_data)
        return sum(e(v) for v in set(d[f] for d in data))
    features = len(data[0]) - 1
    information_gain = [baseline - feature_entropy(f) for f in range(features)]
    best_feature, _ = max(enumerate(information_gain), key=operator.itemgetter(1))
    return best_feature


def potential_leaf_node(data: Data) -> (int, int):
    return collections.Counter(i[-1] for i in data).most_common(1)[0]


def create_tree(data: Data, label: [str]) -> Union[dict, int]:
    category, count = potential_leaf_node(data)
    if count == len(data):
        return category
    node = {}
    feature = best_feature_for_split(data)
    feature_label = label[feature]
    node[feature_label] = {}
    classes = set(d[feature] for d in data)
    for c in classes:
        partitioned_data = [d for d in data if d[feature] == c]
        node[feature_label][c] = create_tree(partitioned_data, label)
    return node


def classify(tree: dict, label: [str], data: Data) -> dict:
    root = list(tree.keys())[0]
    node = tree[root]
    index = label.index(root)
    for k in node.keys():
        if data[index] == k:
            if isinstance(node[k], dict):
                return classify(node[k], label, data)
            return node[k]


def as_rule_str(tree, label: [str], ident: int=0) -> str:
    space_ident = '  ' * ident
    s = space_ident
    root = list(tree.keys())[0]
    node = tree[root]
    index = label.index(root)
    for k in node.keys():
        s += f'if {label[index]} = {k}'
        if isinstance(node[k], dict):
            s += f'\n{space_ident}{as_rule_str(node[k], label, ident + 1)}'
        else:
            s += ' then ' + str(node[k]) + (".\n" if ident == 0 else ", ")
    if s[:-2] == ', ':
        s = s[:-2]
    return f'{s}\n'


def find_edges(tree: dict, label: [str], X, Y):
    X.sort()
    Y.sort()
    diagonals = list(set(X).intersection(set(Y)))
    diagonals.sort()
    L = [classify(tree, label, [d, d]) for d in diagonals]
    low = L.index(False)
    min_x = X[low]
    min_y = Y[low]

    high = L[::-1].index(False)
    max_x = X[len(X) - 1 - high]
    max_y = Y[len(Y) - 1 - high]

    return (min_x, max_x), (min_y, max_y)


if __name__ == '__main__':
    test_data = [[0, 0, False], [-1, 0, True], [1, 0, True], [0, -1, True], [0, 1, True]]
    test_label = ['x', 'y', 'out']
    test_tree = create_tree(test_data, test_label)

    print(classify(test_tree, test_label, [1, 1]))
    print(as_rule_str(test_tree, test_label))
