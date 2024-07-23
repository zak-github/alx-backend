#!/usr/bin/env python3
"""
BasicCache dictionary
"""

BaseCaching = __import__('base_caching').BaseCaching


class BasicCache(BaseCaching):
    """BasicCache class"""

    def put(self, key, item):
        """Saves the item to the cache with the given key
        """
        if key and item:
            self.cache_data[key] = item

    def get(self, key):
        """Returns the value in self.cache_data linked to key or None if key
        is None or doesn't exist in self.cache_data
        """
        return self.cache_data.get(key)
