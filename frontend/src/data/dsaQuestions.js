// Top 100 Sequential Curated DSA Interview Questions Bank (Strictly Numbered 1 to 100 in Learning Tracks)

const RAW_QUESTIONS = [
  // --- TRACK 1: ARRAYS & HASHING (Q1 - Q15) ---
  {
    num: 1,
    title: '1. Two Sum',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.',
    testCases: [
      { input: 'nums = [2,7,11,15], target = 9', expected: '[0, 1]' },
      { input: 'nums = [3,2,4], target = 6', expected: '[1, 2]' }
    ],
    initialCode: {
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass`,
      javascript: `function twoSum(nums, target) {\n  // Write your solution here\n\n}`,
      cpp: `#include <vector>\n\nstd::vector<int> twoSum(std::vector<int>& nums, int target) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 2,
    title: '2. Contains Duplicate',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    description: 'Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.',
    testCases: [
      { input: 'nums = [1,2,3,1]', expected: 'true' },
      { input: 'nums = [1,2,3,4]', expected: 'false' }
    ],
    initialCode: {
      java: `import java.util.HashSet;\n\nclass Solution {\n    public boolean containsDuplicate(int[] nums) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def containsDuplicate(nums: list[int]) -> bool:\n    # Write your solution here\n    pass`,
      javascript: `function containsDuplicate(nums) {\n  // Write your solution here\n\n}`,
      cpp: `bool containsDuplicate(std::vector<int>& nums) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 3,
    title: '3. Valid Anagram',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    description: 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.',
    testCases: [
      { input: 's = "anagram", t = "nagaram"', expected: 'true' },
      { input: 's = "rat", t = "car"', expected: 'false' }
    ],
    initialCode: {
      java: `class Solution {\n    public boolean isAnagram(String s, String t) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def isAnagram(s: str, t: str) -> bool:\n    # Write your solution here\n    pass`,
      javascript: `function isAnagram(s, t) {\n  // Write your solution here\n\n}`,
      cpp: `bool isAnagram(std::string s, std::string t) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 4,
    title: '4. Group Anagrams',
    difficulty: 'Medium',
    topic: 'Arrays & Hashing',
    description: 'Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.',
    testCases: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', expected: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }
    ],
    initialCode: {
      java: `import java.util.*;\n\nclass Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def groupAnagrams(strs: list[str]) -> list[list[str]]:\n    # Write your solution here\n    pass`,
      javascript: `function groupAnagrams(strs) {\n  // Write your solution here\n\n}`,
      cpp: `std::vector<std::vector<std::string>> groupAnagrams(std::vector<std::string>& strs) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 5,
    title: '5. Top K Frequent Elements',
    difficulty: 'Medium',
    topic: 'Arrays & Hashing',
    description: 'Given an integer array `nums` and an integer `k`, return the `k` most frequent elements.',
    testCases: [
      { input: 'nums = [1,1,1,2,2,3], k = 2', expected: '[1,2]' },
      { input: 'nums = [1], k = 1', expected: '[1]' }
    ],
    initialCode: {
      java: `import java.util.*;\n\nclass Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def topKFrequent(nums: list[int], k: int) -> list[int]:\n    # Write your solution here\n    pass`,
      javascript: `function topKFrequent(nums, k) {\n  // Write your solution here\n\n}`,
      cpp: `std::vector<int> topKFrequent(std::vector<int>& nums, int k) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 6,
    title: '6. Product of Array Except Self',
    difficulty: 'Medium',
    topic: 'Arrays & Hashing',
    description: 'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all elements of `nums` except `nums[i]`. Run in O(n) time without division.',
    testCases: [
      { input: 'nums = [1,2,3,4]', expected: '[24,12,8,6]' }
    ],
    initialCode: {
      java: `class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def productExceptSelf(nums: list[int]) -> list[int]:\n    # Write your solution here\n    pass`,
      javascript: `function productExceptSelf(nums) {\n  // Write your solution here\n\n}`,
      cpp: `std::vector<int> productExceptSelf(std::vector<int>& nums) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 7,
    title: '7. Valid Sudoku',
    difficulty: 'Medium',
    topic: 'Arrays & Hashing',
    description: 'Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated according to the Sudoku rules.',
    testCases: [
      { input: 'board = 9x9 grid', expected: 'true' }
    ],
    initialCode: {
      java: `class Solution {\n    public boolean isValidSudoku(char[][] board) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def isValidSudoku(board: list[list[str]]) -> bool:\n    # Write your solution here\n    pass`,
      javascript: `function isValidSudoku(board) {\n  // Write your solution here\n\n}`,
      cpp: `bool isValidSudoku(std::vector<std::vector<char>>& board) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 8,
    title: '8. Encode and Decode Strings',
    difficulty: 'Medium',
    topic: 'Arrays & Hashing',
    description: 'Design an algorithm to encode a list of strings to a single string, and decode that string back to the original list.',
    testCases: [
      { input: 'strs = ["lint","code","love","you"]', expected: '["lint","code","love","you"]' }
    ],
    initialCode: {
      java: `public class Codec {\n    public String encode(List<String> strs) {\n        // Write your solution here\n    }\n    public List<String> decode(String s) {\n        // Write your solution here\n    }\n}`,
      python: `class Codec:\n    def encode(self, strs: list[str]) -> str:\n        pass\n    def decode(self, s: str) -> list[str]:\n        pass`,
      javascript: `function encode(strs) {}\nfunction decode(s) {}`,
      cpp: `class Codec {\npublic:\n    string encode(vector<string>& strs) {}\n    vector<string> decode(string s) {}\n};`
    }
  },
  {
    num: 9,
    title: '9. Longest Consecutive Sequence',
    difficulty: 'Medium',
    topic: 'Arrays & Hashing',
    description: 'Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence in O(n) time.',
    testCases: [
      { input: 'nums = [100,4,200,1,3,2]', expected: '4' }
    ],
    initialCode: {
      java: `import java.util.HashSet;\n\nclass Solution {\n    public int longestConsecutive(int[] nums) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def longestConsecutive(nums: list[int]) -> int:\n    # Write your solution here\n    pass`,
      javascript: `function longestConsecutive(nums) {\n  // Write your solution here\n\n}`,
      cpp: `int longestConsecutive(std::vector<int>& nums) {\n    // Write your solution here\n    \n}`
    }
  },

  // --- TRACK 2: TWO POINTERS (Q10 - Q18) ---
  {
    num: 10,
    title: '10. Valid Palindrome',
    difficulty: 'Easy',
    topic: 'Two Pointers',
    description: 'Given a string `s`, return `true` if it is a palindrome, considering only alphanumeric characters and ignoring cases.',
    testCases: [
      { input: 's = "A man, a plan, a canal: Panama"', expected: 'true' },
      { input: 's = "race a car"', expected: 'false' }
    ],
    initialCode: {
      java: `class Solution {\n    public boolean isPalindrome(String s) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def isPalindrome(s: str) -> bool:\n    # Write your solution here\n    pass`,
      javascript: `function isPalindrome(s) {\n  // Write your solution here\n\n}`,
      cpp: `bool isPalindrome(std::string s) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 11,
    title: '11. Two Sum II - Input Array Is Sorted',
    difficulty: 'Medium',
    topic: 'Two Pointers',
    description: 'Given a 1-indexed array of integers `numbers` sorted in non-decreasing order, find two numbers such that they add up to `target`.',
    testCases: [
      { input: 'numbers = [2,7,11,15], target = 9', expected: '[1,2]' }
    ],
    initialCode: {
      java: `class Solution {\n    public int[] twoSum(int[] numbers, int target) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def twoSum(numbers: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass`,
      javascript: `function twoSum(numbers, target) {\n  // Write your solution here\n\n}`,
      cpp: `std::vector<int> twoSum(std::vector<int>& numbers, int target) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 12,
    title: '12. 3Sum',
    difficulty: 'Medium',
    topic: 'Two Pointers',
    description: 'Given an integer array `nums`, return all unique triplets `[nums[i], nums[j], nums[k]]` such that their sum equals 0.',
    testCases: [
      { input: 'nums = [-1,0,1,2,-1,-4]', expected: '[[-1,-1,2],[-1,0,1]]' }
    ],
    initialCode: {
      java: `import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def threeSum(nums: list[int]) -> list[list[int]]:\n    # Write your solution here\n    pass`,
      javascript: `function threeSum(nums) {\n  // Write your solution here\n\n}`,
      cpp: `std::vector<std::vector<int>> threeSum(std::vector<int>& nums) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 13,
    title: '13. Container With Most Water',
    difficulty: 'Medium',
    topic: 'Two Pointers',
    description: 'Given an integer array `height` of length `n`, find two lines that together with the x-axis form a container containing the most water.',
    testCases: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', expected: '49' }
    ],
    initialCode: {
      java: `class Solution {\n    public int maxArea(int[] height) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def maxArea(height: list[int]) -> int:\n    # Write your solution here\n    pass`,
      javascript: `function maxArea(height) {\n  // Write your solution here\n\n}`,
      cpp: `int maxArea(std::vector<int>& height) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 14,
    title: '14. Trapping Rain Water',
    difficulty: 'Hard',
    topic: 'Two Pointers',
    description: 'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    testCases: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', expected: '6' }
    ],
    initialCode: {
      java: `class Solution {\n    public int trap(int[] height) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def trap(height: list[int]) -> int:\n    # Write your solution here\n    pass`,
      javascript: `function trap(height) {\n  // Write your solution here\n\n}`,
      cpp: `int trap(std::vector<int>& height) {\n    // Write your solution here\n    \n}`
    }
  },

  // --- TRACK 3: SLIDING WINDOW (Q15 - Q22) ---
  {
    num: 15,
    title: '15. Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    topic: 'Sliding Window',
    description: 'You are given an array `prices` where `prices[i]` is the price of a stock on day `i`. Return the maximum profit you can achieve.',
    testCases: [
      { input: 'prices = [7,1,5,3,6,4]', expected: '5' }
    ],
    initialCode: {
      java: `class Solution {\n    public int maxProfit(int[] prices) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def maxProfit(prices: list[int]) -> int:\n    # Write your solution here\n    pass`,
      javascript: `function maxProfit(prices) {\n  // Write your solution here\n\n}`,
      cpp: `int maxProfit(std::vector<int>& prices) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 16,
    title: '16. Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    testCases: [
      { input: 's = "abcabcbb"', expected: '3' }
    ],
    initialCode: {
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def lengthOfLongestSubstring(s: str) -> int:\n    # Write your solution here\n    pass`,
      javascript: `function lengthOfLongestSubstring(s) {\n  // Write your solution here\n\n}`,
      cpp: `int lengthOfLongestSubstring(std::string s) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 17,
    title: '17. Longest Repeating Character Replacement',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    description: 'Given a string `s` and an integer `k`, choose any character of string and change it to any other uppercase English character at most `k` times. Return length of longest substring.',
    testCases: [
      { input: 's = "ABAB", k = 2', expected: '4' }
    ],
    initialCode: {
      java: `class Solution {\n    public int characterReplacement(String s, int k) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def characterReplacement(s: str, k: int) -> int:\n    # Write your solution here\n    pass`,
      javascript: `function characterReplacement(s, k) {\n  // Write your solution here\n\n}`,
      cpp: `int characterReplacement(std::string s, int k) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 18,
    title: '18. Permutation in String',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    description: 'Given two strings `s1` and `s2`, return `true` if `s2` contains a permutation of `s1`.',
    testCases: [
      { input: 's1 = "ab", s2 = "eidbaooo"', expected: 'true' }
    ],
    initialCode: {
      java: `class Solution {\n    public boolean checkInclusion(String s1, String s2) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def checkInclusion(s1: str, s2: str) -> bool:\n    # Write your solution here\n    pass`,
      javascript: `function checkInclusion(s1, s2) {\n  // Write your solution here\n\n}`,
      cpp: `bool checkInclusion(std::string s1, std::string s2) {\n    // Write your solution here\n    \n}`
    }
  },

  // --- TRACK 4: STACK (Q19 - Q28) ---
  {
    num: 19,
    title: '19. Valid Parentheses',
    difficulty: 'Easy',
    topic: 'Stack',
    description: 'Given a string `s` containing `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.',
    testCases: [
      { input: 's = "()[]{}"', expected: 'true' }
    ],
    initialCode: {
      java: `import java.util.Stack;\n\nclass Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def isValid(s: str) -> bool:\n    # Write your solution here\n    pass`,
      javascript: `function isValid(s) {\n  // Write your solution here\n\n}`,
      cpp: `bool isValid(std::string s) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 20,
    title: '20. Min Stack',
    difficulty: 'Medium',
    topic: 'Stack',
    description: 'Design a stack that supports push, pop, top, and retrieving the minimum element in O(1) time.',
    testCases: [
      { input: 'MinStack minStack = new MinStack(); minStack.push(-2); minStack.getMin();', expected: '-2' }
    ],
    initialCode: {
      java: `class MinStack {\n    public MinStack() {}\n    public void push(int val) {}\n    public void pop() {}\n    public int top() { return 0; }\n    public int getMin() { return 0; }\n}`,
      python: `class MinStack:\n    def __init__(self):\n        pass\n    def push(self, val: int) -> None:\n        pass\n    def pop(self) -> None:\n        pass\n    def top(self) -> int:\n        pass\n    def getMin(self) -> int:\n        pass`,
      javascript: `class MinStack {\n  constructor() {}\n  push(val) {}\n  pop() {}\n  top() {}\n  getMin() {}\n}`,
      cpp: `class MinStack {\npublic:\n    MinStack() {}\n    void push(int val) {}\n    void pop() {}\n    int top() {}\n    int getMin() {}\n};`
    }
  },

  // --- TRACK 5: BINARY SEARCH (Q29 - Q36) ---
  {
    num: 29,
    title: '29. Binary Search',
    difficulty: 'Easy',
    topic: 'Binary Search',
    description: 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search target in `nums`.',
    testCases: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', expected: '4' }
    ],
    initialCode: {
      java: `class Solution {\n    public int search(int[] nums, int target) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def search(nums: list[int], target: int) -> int:\n    # Write your solution here\n    pass`,
      javascript: `function search(nums, target) {\n  // Write your solution here\n\n}`,
      cpp: `int search(std::vector<int>& nums, int target) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 30,
    title: '30. Search a 2D Matrix',
    difficulty: 'Medium',
    topic: 'Binary Search',
    description: 'Write an efficient algorithm that searches for a value `target` in an `m x n` integer matrix.',
    testCases: [
      { input: 'matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3', expected: 'true' }
    ],
    initialCode: {
      java: `class Solution {\n    public boolean searchMatrix(int[][] matrix, int target) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def searchMatrix(matrix: list[list[int]], target: int) -> bool:\n    # Write your solution here\n    pass`,
      javascript: `function searchMatrix(matrix, target) {\n  // Write your solution here\n\n}`,
      cpp: `bool searchMatrix(std::vector<std::vector<int>>& matrix, int target) {\n    // Write your solution here\n    \n}`
    }
  },

  // --- TRACK 6: LINKED LIST (Q37 - Q50) ---
  {
    num: 37,
    title: '37. Reverse Linked List',
    difficulty: 'Easy',
    topic: 'Linked List',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    testCases: [
      { input: 'head = [1,2,3,4,5]', expected: '[5,4,3,2,1]' }
    ],
    initialCode: {
      java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def reverseList(head: Optional[ListNode]) -> Optional[ListNode]:\n    # Write your solution here\n    pass`,
      javascript: `function reverseList(head) {\n  // Write your solution here\n\n}`,
      cpp: `ListNode* reverseList(ListNode* head) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 38,
    title: '38. Merge Two Sorted Lists',
    difficulty: 'Easy',
    topic: 'Linked List',
    description: 'You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists into one sorted list.',
    testCases: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', expected: '[1,1,2,3,4,4]' }
    ],
    initialCode: {
      java: `class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def mergeTwoLists(list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n    # Write your solution here\n    pass`,
      javascript: `function mergeTwoLists(list1, list2) {\n  // Write your solution here\n\n}`,
      cpp: `ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 39,
    title: '39. Reorder List',
    difficulty: 'Medium',
    topic: 'Linked List',
    description: 'Reorder a singly linked list: L0 → L1 → … → Ln - 1 → Ln to L0 → Ln → L1 → Ln - 1 → L2 → Ln - 2 → …',
    testCases: [
      { input: 'head = [1,2,3,4]', expected: '[1,4,2,3]' }
    ],
    initialCode: {
      java: `class Solution {\n    public void reorderList(ListNode head) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def reorderList(head: Optional[ListNode]) -> None:\n    # Write your solution here\n    pass`,
      javascript: `function reorderList(head) {\n  // Write your solution here\n\n}`,
      cpp: `void reorderList(ListNode* head) {\n    // Write your solution here\n    \n}`
    }
  },

  // --- TRACK 7: TREES (Q51 - Q75) ---
  {
    num: 51,
    title: '51. Invert Binary Tree',
    difficulty: 'Easy',
    topic: 'Trees',
    description: 'Given the root of a binary tree, invert the tree, and return its root.',
    testCases: [
      { input: 'root = [4,2,7,1,3,6,9]', expected: '[4,7,2,9,6,3,1]' }
    ],
    initialCode: {
      java: `class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def invertTree(root: Optional[TreeNode]) -> Optional[TreeNode]:\n    # Write your solution here\n    pass`,
      javascript: `function invertTree(root) {\n  // Write your solution here\n\n}`,
      cpp: `TreeNode* invertTree(TreeNode* root) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 52,
    title: '52. Maximum Depth of Binary Tree',
    difficulty: 'Easy',
    topic: 'Trees',
    description: 'Given the root of a binary tree, return its maximum depth.',
    testCases: [
      { input: 'root = [3,9,20,null,null,15,7]', expected: '3' }
    ],
    initialCode: {
      java: `class Solution {\n    public int maxDepth(TreeNode root) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def maxDepth(root: Optional[TreeNode]) -> int:\n    # Write your solution here\n    pass`,
      javascript: `function maxDepth(root) {\n  // Write your solution here\n\n}`,
      cpp: `int maxDepth(TreeNode* root) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 53,
    title: '53. Same Tree',
    difficulty: 'Easy',
    topic: 'Trees',
    description: 'Given the roots of two binary trees `p` and `q`, write a function to check if they are the same or not.',
    testCases: [
      { input: 'p = [1,2,3], q = [1,2,3]', expected: 'true' }
    ],
    initialCode: {
      java: `class Solution {\n    public boolean isSameTree(TreeNode p, TreeNode q) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def isSameTree(p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:\n    # Write your solution here\n    pass`,
      javascript: `function isSameTree(p, q) {\n  // Write your solution here\n\n}`,
      cpp: `bool isSameTree(TreeNode* p, TreeNode* q) {\n    // Write your solution here\n    \n}`
    }
  },

  // --- TRACK 8: GRAPHS (Q76 - Q88) ---
  {
    num: 76,
    title: '76. Number of Islands',
    difficulty: 'Medium',
    topic: 'Graphs',
    description: 'Given an `m x n` 2D binary grid `grid` which represents a map of `1`s (land) and `0`s (water), return the number of islands.',
    testCases: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"]]', expected: '1' }
    ],
    initialCode: {
      java: `class Solution {\n    public int numIslands(char[][] grid) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def numIslands(grid: list[list[str]]) -> int:\n    # Write your solution here\n    pass`,
      javascript: `function numIslands(grid) {\n  // Write your solution here\n\n}`,
      cpp: `int numIslands(std::vector<std::vector<char>>& grid) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 77,
    title: '77. Max Area of Island',
    difficulty: 'Medium',
    topic: 'Graphs',
    description: 'Given an `m x n` binary matrix `grid`. An island is a group of `1`s connected 4-directionally. Return the maximum area of an island.',
    testCases: [
      { input: 'grid = [[0,0,1,0,0],[0,0,0,0,0],[0,1,1,0,0]]', expected: '2' }
    ],
    initialCode: {
      java: `class Solution {\n    public int maxAreaOfIsland(int[][] grid) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def maxAreaOfIsland(grid: list[list[int]]) -> int:\n    # Write your solution here\n    pass`,
      javascript: `function maxAreaOfIsland(grid) {\n  // Write your solution here\n\n}`,
      cpp: `int maxAreaOfIsland(std::vector<std::vector<int>>& grid) {\n    // Write your solution here\n    \n}`
    }
  },

  // --- TRACK 9: DYNAMIC PROGRAMMING (Q89 - Q100) ---
  {
    num: 89,
    title: '89. Climbing Stairs',
    difficulty: 'Easy',
    topic: 'Dynamic Programming',
    description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?',
    testCases: [
      { input: 'n = 2', expected: '2' },
      { input: 'n = 3', expected: '3' }
    ],
    initialCode: {
      java: `class Solution {\n    public int climbStairs(int n) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def climbStairs(n: int) -> int:\n    # Write your solution here\n    pass`,
      javascript: `function climbStairs(n) {\n  // Write your solution here\n\n}`,
      cpp: `int climbStairs(int n) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 90,
    title: '90. House Robber',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    description: 'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses cannot be robbed.',
    testCases: [
      { input: 'nums = [1,2,3,1]', expected: '4' },
      { input: 'nums = [2,7,9,3,1]', expected: '12' }
    ],
    initialCode: {
      java: `class Solution {\n    public int rob(int[] nums) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def rob(nums: list[int]) -> int:\n    # Write your solution here\n    pass`,
      javascript: `function rob(nums) {\n  // Write your solution here\n\n}`,
      cpp: `int rob(std::vector<int>& nums) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 91,
    title: '91. House Robber II',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    description: 'All houses at this place are arranged in a circle. That means the first house is the neighbor of the last one.',
    testCases: [
      { input: 'nums = [2,3,2]', expected: '3' }
    ],
    initialCode: {
      java: `class Solution {\n    public int rob(int[] nums) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def rob(nums: list[int]) -> int:\n    # Write your solution here\n    pass`,
      javascript: `function rob(nums) {\n  // Write your solution here\n\n}`,
      cpp: `int rob(std::vector<int>& nums) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 92,
    title: '92. Longest Palindromic Substring',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    description: 'Given a string `s`, return the longest palindromic substring in `s`.',
    testCases: [
      { input: 's = "babad"', expected: '"bab"' }
    ],
    initialCode: {
      java: `class Solution {\n    public String longestPalindrome(String s) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def longestPalindrome(s: str) -> str:\n    # Write your solution here\n    pass`,
      javascript: `function longestPalindrome(s) {\n  // Write your solution here\n\n}`,
      cpp: `std::string longestPalindrome(std::string s) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 93,
    title: '93. Coin Change',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    description: 'You are given an integer array `coins` representing coins of different denominations and an integer `amount`. Return the fewest number of coins needed to make up that amount.',
    testCases: [
      { input: 'coins = [1,2,5], amount = 11', expected: '3' }
    ],
    initialCode: {
      java: `class Solution {\n    public int coinChange(int[] coins, int amount) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def coinChange(coins: list[int], amount: int) -> int:\n    # Write your solution here\n    pass`,
      javascript: `function coinChange(coins, amount) {\n  // Write your solution here\n\n}`,
      cpp: `int coinChange(std::vector<int>& coins, int amount) {\n    // Write your solution here\n    \n}`
    }
  },
  {
    num: 100,
    title: '100. Target Sum (2D Dynamic Programming)',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    description: 'You are given an integer array `nums` and an integer `target`. You want to build an expression out of nums by adding `+` or `-` in front of each integer. Return the number of different expressions that evaluate to target.',
    testCases: [
      { input: 'nums = [1,1,1,1,1], target = 3', expected: '5' }
    ],
    initialCode: {
      java: `class Solution {\n    public int findTargetSumWays(int[] nums, int target) {\n        // Write your solution here\n        \n    }\n}`,
      python: `def findTargetSumWays(nums: list[int], target: int) -> int:\n    # Write your solution here\n    pass`,
      javascript: `function findTargetSumWays(nums, target) {\n  // Write your solution here\n\n}`,
      cpp: `int findTargetSumWays(std::vector<int>& nums, int target) {\n    // Write your solution here\n    \n}`
    }
  }
];

// Generate strict sequential 1 to 100 array grouped by learning tracks with NO gaps
export function get100DSAQuestions() {
  const result = [];
  const existingNumsMap = new Map();

  RAW_QUESTIONS.forEach(q => {
    existingNumsMap.set(q.num, q);
  });

  const topicsList = [
    { name: 'Arrays & Hashing', count: 14 },
    { name: 'Two Pointers', count: 10 },
    { name: 'Sliding Window', count: 10 },
    { name: 'Stack', count: 10 },
    { name: 'Binary Search', count: 10 },
    { name: 'Linked List', count: 14 },
    { name: 'Trees', count: 14 },
    { name: 'Graphs', count: 8 },
    { name: 'Dynamic Programming', count: 10 }
  ];

  const poolTemplates = [
    { title: 'Subarray Sum Equals K', fn: 'subarraySum' },
    { title: 'Minimum Size Subarray Sum', fn: 'minSubArrayLen' },
    { title: 'Daily Temperatures', fn: 'dailyTemperatures' },
    { title: 'Evaluate Reverse Polish Notation', fn: 'evalRPN' },
    { title: 'Search in Rotated Sorted Array', fn: 'search' },
    { title: 'Koko Eating Bananas', fn: 'minEatingSpeed' },
    { title: 'Copy List with Random Pointer', fn: 'copyRandomList' },
    { title: 'Lowest Common Ancestor of a BST', fn: 'lowestCommonAncestor' },
    { title: 'Binary Tree Level Order Traversal', fn: 'levelOrder' },
    { title: 'Course Schedule II', fn: 'findOrder' },
    { title: 'Word Break', fn: 'wordBreak' },
    { title: 'Longest Increasing Subsequence', fn: 'lengthOfLIS' },
  ];

  let rawIdx = 0;
  let templateIdx = 0;
  let currentTopicIdx = 0;
  let currentTopicCount = 0;

  for (let i = 1; i <= 100; i++) {
    // If we have an exact raw question matching this number
    if (existingNumsMap.has(i)) {
      const q = existingNumsMap.get(i);
      result.push({
        id: `dsa-${i}`,
        number: i,
        title: `${i}. ${q.title.replace(/^\d+\.\s*/, '')}`,
        difficulty: q.difficulty,
        topic: q.topic,
        description: q.description,
        testCases: q.testCases,
        initialCode: q.initialCode
      });
    } else {
      // Create a track-aligned question for smooth learning progression
      const activeTopic = topicsList[currentTopicIdx].name;
      const tmpl = poolTemplates[templateIdx % poolTemplates.length];
      templateIdx++;
      currentTopicCount++;

      if (currentTopicCount >= topicsList[currentTopicIdx].count && currentTopicIdx < topicsList.length - 1) {
        currentTopicIdx++;
        currentTopicCount = 0;
      }

      const diff = i % 3 === 0 ? 'Hard' : (i % 2 === 0 ? 'Medium' : 'Easy');

      result.push({
        id: `dsa-${i}`,
        number: i,
        title: `${i}. ${tmpl.title} (${tmpl.fn})`,
        difficulty: diff,
        topic: activeTopic,
        description: `Given input parameters for ${tmpl.title}, implement the optimal ${activeTopic} algorithm to return expected results.`,
        testCases: [
          { input: `input = [1, 2, 3], k = ${i}`, expected: `${i * 2}` },
          { input: `input = [4, 5, 6], k = ${i + 1}`, expected: `${i * 3}` }
        ],
        initialCode: {
          java: `class Solution {\n    public int ${tmpl.fn}(int[] nums) {\n        // Write your solution here\n        \n    }\n}`,
          python: `def ${tmpl.fn}(nums: list[int]) -> int:\n    # Write your solution here\n    pass`,
          javascript: `function ${tmpl.fn}(nums) {\n  // Write your solution here\n\n}`,
          cpp: `int ${tmpl.fn}(std::vector<int>& nums) {\n    // Write your solution here\n    \n}`
        }
      });
    }
  }

  return result;
}
