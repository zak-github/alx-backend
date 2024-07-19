#!/usr/bin/env python3
"""
Deletion-Resilient Hypermedia Pagination
"""

import csv
import math
from typing import Dict, List


class Server:
    """Server class to paginate a database of popular baby names.
    """
    DATA_FILE = "Popular_Baby_Names.csv"

    def __init__(self):
        self.__dataset = None
        self.__indexed_dataset = None

    def dataset(self) -> List[List]:
        """Cached dataset
        """
        if self.__dataset is None:
            with open(self.DATA_FILE) as f:
                reader = csv.reader(f)
                dataset = [row for row in reader]
            self.__dataset = dataset[1:]

        return self.__dataset

    def indexed_dataset(self) -> Dict[int, List]:
        """Dataset indexed by sorting position, starting at 0
        """
        if self.__indexed_dataset is None:
            dataset = self.dataset()
            truncated_dataset = dataset[:1000]
            self.__indexed_dataset = {
                i: dataset[i]
                for i in range(len(dataset))
            }
        return self.__indexed_dataset

    def get_hyper_index(self, index: int = None, page_size: int = 10) -> Dict:
        """
        constructs a dictionary metadata for the requested page and returns it
        it is safe against deleted data
        """
        indexed_dataset = self.indexed_dataset()
        if index is None:
            index = 0
        assert type(index) == int and type(page_size) == int
        assert index >= 0 and index < len(indexed_dataset) and page_size > 0

        keys = sorted(list(indexed_dataset.keys()))
        st_index = index
        while st_index not in keys:
            st_index += 1

        data = []
        while (len(data) < page_size and st_index in keys
               and st_index < len(indexed_dataset)):
            data.append(indexed_dataset[st_index])
            st_index += 1
        end_index = st_index

        return {
            'index': index,
            'data': data,
            'page_size': page_size,
            'next_index': end_index,
        }
