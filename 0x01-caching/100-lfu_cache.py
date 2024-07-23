#!/usr/bin/env python3
"""
LFUCaching
"""
from collections import defaultdict

BaseCaching = __import__('base_caching').BaseCaching


class LFUCache(BaseCaching):
    """LFUCache Class
    This is a caching class that uses LRU Algorithm
    """

    def __init__(self) -> None:
        """Initializes the LFUCache with a list of empty keys and dictionary
        """
        super().__init__()
        self.keys = []
        self.frequency = defaultdict(lambda: 0)

    def put(self, key, item):
        """Saves the item to the cache with the given key
        """
        if key and item:
            if key not in self.keys:
                if len(self.keys) == self.MAX_ITEMS:
                    min_freq = min(self.frequency.values())
                    l_freq = list(
                        filter(lambda item: item[1] == min_freq,
                               self.frequency.items()))
                    if len(l_freq) == 1:
                        rm_key = l_freq[0][0]
                    else:
                        idxs = sorted([(self.keys.index(k[0]), k[0])
                                       for k in l_freq])
                        rm_key = idxs[0][1]
                    self.keys.remove(rm_key)
                    self.frequency.pop(rm_key)
                    self.cache_data.pop(rm_key)
                    print(f'DISCARD: {rm_key}')

                self.keys.append(key)

            self.frequency[key] += 1
            self.cache_data[key] = item

    def get(self, key):
        """Returns the value in self.cache_data linked to key or None if key
        is None or doesn't exist in self.cache_data
        """
        if key in self.cache_data:
            self.frequency[key] += 1
            self.keys.remove(key)
            self.keys.append(key)
        return self.cache_data.get(key)
