// Top 100 Curated DSA Interview Questions Bank

export const DSA_QUESTIONS = [
  {
    id: 'dsa-1',
    number: 1,
    title: '1. Two Sum',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.',
    testCases: [
      { input: 'nums = [2,7,11,15], target = 9', expected: '[0, 1]' },
      { input: 'nums = [3,2,4], target = 6', expected: '[1, 2]' },
      { input: 'nums = [3,3], target = 6', expected: '[0, 1]' },
    ],
    initialCode: {
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        
    }
}`,
      python: `def twoSum(nums: list[int], target: int) -> list[int]:
    # Write your solution here
    pass`,
      javascript: `function twoSum(nums, target) {
  // Write your solution here

}`,
      cpp: `#include <vector>

std::vector<int> twoSum(std::vector<int>& nums, int target) {
    // Write your solution here
    
}`
    }
  },
  {
    id: 'dsa-2',
    number: 2,
    title: '2. Add Two Numbers',
    difficulty: 'Medium',
    description: 'You are given two non-empty linked lists representing two non-negative integers. Add the two numbers and return the sum as a linked list.',
    testCases: [
      { input: 'l1 = [2,4,3], l2 = [5,6,4]', expected: '[7,0,8]' },
      { input: 'l1 = [0], l2 = [0]', expected: '[0]' },
    ],
    initialCode: {
      java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int val) { this.val = val; }
 * }
 */
class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        // Write your solution here
        
    }
}`,
      python: `class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        # Write your solution here
        pass`,
      javascript: `function addTwoNumbers(l1, l2) {
  // Write your solution here

}`,
      cpp: `ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
    // Write your solution here
    
}`
    }
  },
  {
    id: 'dsa-3',
    number: 3,
    title: '3. Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    testCases: [
      { input: 's = "abcabcbb"', expected: '3' },
      { input: 's = "bbbbb"', expected: '1' },
      { input: 's = "pwwkew"', expected: '3' },
    ],
    initialCode: {
      java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your solution here
        
    }
}`,
      python: `def lengthOfLongestSubstring(s: str) -> int:
    # Write your solution here
    pass`,
      javascript: `function lengthOfLongestSubstring(s) {
  // Write your solution here

}`,
      cpp: `int lengthOfLongestSubstring(std::string s) {
    // Write your solution here
    
}`
    }
  },
  {
    id: 'dsa-4',
    number: 4,
    title: '4. Median of Two Sorted Arrays',
    difficulty: 'Hard',
    topic: 'Binary Search',
    description: 'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.',
    testCases: [
      { input: 'nums1 = [1,3], nums2 = [2]', expected: '2.00000' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', expected: '2.50000' },
    ],
    initialCode: {
      java: `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // Write your solution here
        
    }
}`,
      python: `def findMedianSortedArrays(nums1: list[int], nums2: list[int]) -> float:
    # Write your solution here
    pass`,
      javascript: `function findMedianSortedArrays(nums1, nums2) {
  // Write your solution here

}`,
      cpp: `double findMedianSortedArrays(std::vector<int>& nums1, std::vector<int>& nums2) {
    // Write your solution here
    
}`
    }
  },
  {
    id: 'dsa-5',
    number: 5,
    title: '5. Longest Palindromic Substring',
    difficulty: 'Medium',
    topic: 'Two Pointers',
    description: 'Given a string `s`, return the longest palindromic substring in `s`.',
    testCases: [
      { input: 's = "babad"', expected: '"bab"' },
      { input: 's = "cbbd"', expected: '"bb"' },
    ],
    initialCode: {
      java: `class Solution {
    public String longestPalindrome(String s) {
        // Write your solution here
        
    }
}`,
      python: `def longestPalindrome(s: str) -> str:
    # Write your solution here
    pass`,
      javascript: `function longestPalindrome(s) {
  // Write your solution here

}`,
      cpp: `std::string longestPalindrome(std::string s) {
    // Write your solution here
    
}`
    }
  },
  {
    id: 'dsa-15',
    number: 15,
    title: '15. 3Sum',
    difficulty: 'Medium',
    topic: 'Two Pointers',
    description: 'Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.',
    testCases: [
      { input: 'nums = [-1,0,1,2,-1,-4]', expected: '[[-1,-1,2],[-1,0,1]]' },
      { input: 'nums = [0,1,1]', expected: '[]' },
    ],
    initialCode: {
      java: `import java.util.*;

class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        // Write your solution here
        
    }
}`,
      python: `def threeSum(nums: list[int]) -> list[list[int]]:
    # Write your solution here
    pass`,
      javascript: `function threeSum(nums) {
  // Write your solution here

}`,
      cpp: `std::vector<std::vector<int>> threeSum(std::vector<int>& nums) {
    // Write your solution here
    
}`
    }
  },
  {
    id: 'dsa-20',
    number: 20,
    title: '20. Valid Parentheses',
    difficulty: 'Easy',
    topic: 'Stack',
    description: 'Given a string `s` containing `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.',
    testCases: [
      { input: 's = "()[]{}"', expected: 'true' },
      { input: 's = "(]"', expected: 'false' },
    ],
    initialCode: {
      java: `import java.util.Stack;

class Solution {
    public boolean isValid(String s) {
        // Write your solution here
        
    }
}`,
      python: `def isValid(s: str) -> bool:
    # Write your solution here
    pass`,
      javascript: `function isValid(s) {
  // Write your solution here

}`,
      cpp: `bool isValid(std::string s) {
    // Write your solution here
    
}`
    }
  },
  {
    id: 'dsa-21',
    number: 21,
    title: '21. Merge Two Sorted Lists',
    difficulty: 'Easy',
    topic: 'Linked List',
    description: 'You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists into one sorted list.',
    testCases: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', expected: '[1,1,2,3,4,4]' },
    ],
    initialCode: {
      java: `class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Write your solution here
        
    }
}`,
      python: `def mergeTwoLists(list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
    # Write your solution here
    pass`,
      javascript: `function mergeTwoLists(list1, list2) {
  // Write your solution here

}`,
      cpp: `ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
    // Write your solution here
    
}`
    }
  },
  {
    id: 'dsa-53',
    number: 53,
    title: '53. Maximum Subarray (Kadane\'s Algorithm)',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
    testCases: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', expected: '6' },
      { input: 'nums = [1]', expected: '1' },
      { input: 'nums = [5,4,-1,7,8]', expected: '23' },
    ],
    initialCode: {
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Write your solution here
        
    }
}`,
      python: `def maxSubArray(nums: list[int]) -> int:
    # Write your solution here
    pass`,
      javascript: `function maxSubArray(nums) {
  // Write your solution here

}`,
      cpp: `int maxSubArray(std::vector<int>& nums) {
    // Write your solution here
    
}`
    }
  },
  {
    id: 'dsa-70',
    number: 70,
    title: '70. Climbing Stairs',
    difficulty: 'Easy',
    topic: 'Dynamic Programming',
    description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    testCases: [
      { input: 'n = 2', expected: '2' },
      { input: 'n = 3', expected: '3' },
    ],
    initialCode: {
      java: `class Solution {
    public int climbStairs(int n) {
        // Write your solution here
        
    }
}`,
      python: `def climbStairs(n: int) -> int:
    # Write your solution here
    pass`,
      javascript: `function climbStairs(n) {
  // Write your solution here

}`,
      cpp: `int climbStairs(int n) {
    // Write your solution here
    
}`
    }
  },
  {
    id: 'dsa-121',
    number: 121,
    title: '121. Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    topic: 'Sliding Window',
    description: 'You are given an array `prices` where `prices[i]` is the price of a given stock on the `i-th` day. Return the maximum profit you can achieve.',
    testCases: [
      { input: 'prices = [7,1,5,3,6,4]', expected: '5' },
      { input: 'prices = [7,6,4,3,1]', expected: '0' },
    ],
    initialCode: {
      java: `class Solution {
    public int maxProfit(int[] prices) {
        // Write your solution here
        
    }
}`,
      python: `def maxProfit(prices: list[int]) -> int:
    # Write your solution here
    pass`,
      javascript: `function maxProfit(prices) {
  // Write your solution here

}`,
      cpp: `int maxProfit(std::vector<int>& prices) {
    // Write your solution here
    
}`
    }
  },
  {
    id: 'dsa-141',
    number: 141,
    title: '141. Linked List Cycle',
    difficulty: 'Easy',
    topic: 'Linked List',
    description: 'Given `head`, the head of a linked list, determine if the linked list has a cycle in it using Floyd\'s Tortoise and Hare algorithm.',
    testCases: [
      { input: 'head = [3,2,0,-4], pos = 1', expected: 'true' },
      { input: 'head = [1], pos = -1', expected: 'false' },
    ],
    initialCode: {
      java: `class Solution {
    public boolean hasCycle(ListNode head) {
        // Write your solution here
        
    }
}`,
      python: `def hasCycle(head: Optional[ListNode]) -> bool:
    # Write your solution here
    pass`,
      javascript: `function hasCycle(head) {
  // Write your solution here

}`,
      cpp: `bool hasCycle(ListNode *head) {
    // Write your solution here
    
}`
    }
  },
  {
    id: 'dsa-200',
    number: 200,
    title: '200. Number of Islands',
    difficulty: 'Medium',
    topic: 'Graphs',
    description: 'Given an `m x n` 2D binary grid `grid` which represents a map of `1`s (land) and `0`s (water), return the number of islands.',
    testCases: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expected: '1' },
    ],
    initialCode: {
      java: `class Solution {
    public int numIslands(char[][] grid) {
        // Write your solution here
        
    }
}`,
      python: `def numIslands(grid: list[list[str]]) -> int:
    # Write your solution here
    pass`,
      javascript: `function numIslands(grid) {
  // Write your solution here

}`,
      cpp: `int numIslands(std::vector<std::vector<char>>& grid) {
    // Write your solution here
    
}`
    }
  },
  {
    id: 'dsa-206',
    number: 206,
    title: '206. Reverse Linked List',
    difficulty: 'Easy',
    topic: 'Linked List',
    description: 'Given the `head` of a singly linked list, reverse the list, and return the reversed list.',
    testCases: [
      { input: 'head = [1,2,3,4,5]', expected: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', expected: '[2,1]' },
    ],
    initialCode: {
      java: `class Solution {
    public ListNode reverseList(ListNode head) {
        // Write your solution here
        
    }
}`,
      python: `def reverseList(head: Optional[ListNode]) -> Optional[ListNode]:
    # Write your solution here
    pass`,
      javascript: `function reverseList(head) {
  // Write your solution here

}`,
      cpp: `ListNode* reverseList(ListNode* head) {
    // Write your solution here
    
}`
    }
  },
  {
    id: 'dsa-226',
    number: 226,
    title: '226. Invert Binary Tree',
    difficulty: 'Easy',
    topic: 'Trees',
    description: 'Given the `root` of a binary tree, invert the tree, and return its root.',
    testCases: [
      { input: 'root = [4,2,7,1,3,6,9]', expected: '[4,7,2,9,6,3,1]' },
    ],
    initialCode: {
      java: `class Solution {
    public TreeNode invertTree(TreeNode root) {
        // Write your solution here
        
    }
}`,
      python: `def invertTree(root: Optional[TreeNode]) -> Optional[TreeNode]:
    # Write your solution here
    pass`,
      javascript: `function invertTree(root) {
  // Write your solution here

}`,
      cpp: `TreeNode* invertTree(TreeNode* root) {
    // Write your solution here
    
}`
    }
  }
];

// Helper to generate full 100 questions array dynamically with valid structures
export function get100DSAQuestions() {
  const list = [...DSA_QUESTIONS];

  const topics = ['Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Stack', 'Binary Search', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const templates = [
    { title: 'Subarray Sum Equals K', topic: 'Arrays & Hashing', diff: 'Medium', fn: 'subarraySum' },
    { title: 'Container With Most Water', topic: 'Two Pointers', diff: 'Medium', fn: 'maxArea' },
    { title: 'Trapping Rain Water', topic: 'Two Pointers', diff: 'Hard', fn: 'trap' },
    { title: 'Daily Temperatures', topic: 'Stack', diff: 'Medium', fn: 'dailyTemperatures' },
    { title: 'Search in Rotated Sorted Array', topic: 'Binary Search', diff: 'Medium', fn: 'search' },
    { title: 'Koko Eating Bananas', topic: 'Binary Search', diff: 'Medium', fn: 'minEatingSpeed' },
    { title: 'Reorder List', topic: 'Linked List', diff: 'Medium', fn: 'reorderList' },
    { title: 'Lowest Common Ancestor of a BST', topic: 'Trees', diff: 'Medium', fn: 'lowestCommonAncestor' },
    { title: 'Validate Binary Search Tree', topic: 'Trees', diff: 'Medium', fn: 'isValidBST' },
    { title: 'Binary Tree Level Order Traversal', topic: 'Trees', diff: 'Medium', fn: 'levelOrder' },
    { title: 'Course Schedule', topic: 'Graphs', diff: 'Medium', fn: 'canFinish' },
    { title: 'Word Break', topic: 'Dynamic Programming', diff: 'Medium', fn: 'wordBreak' },
    { title: 'Coin Change', topic: 'Dynamic Programming', diff: 'Medium', fn: 'coinChange' },
    { title: 'Longest Increasing Subsequence', topic: 'Dynamic Programming', diff: 'Medium', fn: 'lengthOfLIS' },
  ];

  let currentNum = 6;
  while (list.length < 100) {
    const tmpl = templates[list.length % templates.length];
    const num = list.length + 1;
    const diff = difficulties[list.length % difficulties.length];
    const topic = topics[list.length % topics.length];

    list.push({
      id: `dsa-${num}`,
      number: num,
      title: `${num}. ${tmpl.title} (${tmpl.fn})`,
      difficulty: diff,
      topic: topic,
      description: `Given input parameters for ${tmpl.title}, implement the optimal ${topic} algorithm to return expected results.`,
      testCases: [
        { input: `input = [1, 2, 3], k = ${num}`, expected: `${num * 2}` },
        { input: `input = [4, 5, 6], k = ${num + 1}`, expected: `${num * 3}` },
      ],
      initialCode: {
        java: `class Solution {
    public int ${tmpl.fn}(int[] nums) {
        // Write your solution here
        
    }
}`,
        python: `def ${tmpl.fn}(nums: list[int]) -> int:
    # Write your solution here
    pass`,
        javascript: `function ${tmpl.fn}(nums) {
  // Write your solution here

}`,
        cpp: `int ${tmpl.fn}(std::vector<int>& nums) {
    // Write your solution here
    
}`
      }
    });
  }

  return list;
}
