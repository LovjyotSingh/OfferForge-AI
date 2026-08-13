const fs = require('fs');
const path = require('path');

const TOP 100_LIST = [
  // ARRAYS & HASHING (1 - 12)
  { num: 1, title: '1. Two Sum', topic: 'Arrays & Hashing', diff: 'Easy', fn: 'twoSum' },
  { num: 2, title: '2. Contains Duplicate', topic: 'Arrays & Hashing', diff: 'Easy', fn: 'containsDuplicate' },
  { num: 3, title: '3. Valid Anagram', topic: 'Arrays & Hashing', diff: 'Easy', fn: 'isAnagram' },
  { num: 4, title: '4. Group Anagrams', topic: 'Arrays & Hashing', diff: 'Medium', fn: 'groupAnagrams' },
  { num: 5, title: '5. Top K Frequent Elements', topic: 'Arrays & Hashing', diff: 'Medium', fn: 'topKFrequent' },
  { num: 6, title: '6. Product of Array Except Self', topic: 'Arrays & Hashing', diff: 'Medium', fn: 'productExceptSelf' },
  { num: 7, title: '7. Valid Sudoku', topic: 'Arrays & Hashing', diff: 'Medium', fn: 'isValidSudoku' },
  { num: 8, title: '8. Encode and Decode Strings', topic: 'Arrays & Hashing', diff: 'Medium', fn: 'encode' },
  { num: 9, title: '9. Longest Consecutive Sequence', topic: 'Arrays & Hashing', diff: 'Medium', fn: 'longestConsecutive' },

  // TWO POINTERS (10 - 18)
  { num: 10, title: '10. Valid Palindrome', topic: 'Two Pointers', diff: 'Easy', fn: 'isPalindrome' },
  { num: 11, title: '11. Two Sum II - Input Array Is Sorted', topic: 'Two Pointers', diff: 'Medium', fn: 'twoSum' },
  { num: 12, title: '12. 3Sum', topic: 'Two Pointers', diff: 'Medium', fn: 'threeSum' },
  { num: 13, title: '13. Container With Most Water', topic: 'Two Pointers', diff: 'Medium', fn: 'maxArea' },
  { num: 14, title: '14. Trapping Rain Water', topic: 'Two Pointers', diff: 'Hard', fn: 'trap' },

  // SLIDING WINDOW (15 - 22)
  { num: 15, title: '15. Best Time to Buy and Sell Stock', topic: 'Sliding Window', diff: 'Easy', fn: 'maxProfit' },
  { num: 16, title: '16. Longest Substring Without Repeating Characters', topic: 'Sliding Window', diff: 'Medium', fn: 'lengthOfLongestSubstring' },
  { num: 17, title: '17. Longest Repeating Character Replacement', topic: 'Sliding Window', diff: 'Medium', fn: 'characterReplacement' },
  { num: 18, title: '18. Permutation in String', topic: 'Sliding Window', diff: 'Medium', fn: 'checkInclusion' },
  { num: 19, title: '19. Minimum Window Substring', topic: 'Sliding Window', diff: 'Hard', fn: 'minWindow' },

  // STACK (20 - 27)
  { num: 20, title: '20. Valid Parentheses', topic: 'Stack', diff: 'Easy', fn: 'isValid' },
  { num: 21, title: '21. Min Stack', topic: 'Stack', diff: 'Medium', fn: 'getMin' },
  { num: 22, title: '22. Evaluate Reverse Polish Notation', topic: 'Stack', diff: 'Medium', fn: 'evalRPN' },
  { num: 23, title: '23. Generate Parentheses', topic: 'Stack', diff: 'Medium', fn: 'generateParenthesis' },
  { num: 24, title: '24. Daily Temperatures', topic: 'Stack', diff: 'Medium', fn: 'dailyTemperatures' },
  { num: 25, title: '25. Car Fleet', topic: 'Stack', diff: 'Medium', fn: 'carFleet' },
  { num: 26, title: '26. Largest Rectangle in Histogram', topic: 'Stack', diff: 'Hard', fn: 'largestRectangleArea' },

  // BINARY SEARCH (27 - 34)
  { num: 27, title: '27. Binary Search', topic: 'Binary Search', diff: 'Easy', fn: 'search' },
  { num: 28, title: '28. Search a 2D Matrix', topic: 'Binary Search', diff: 'Medium', fn: 'searchMatrix' },
  { num: 29, title: '29. Koko Eating Bananas', topic: 'Binary Search', diff: 'Medium', fn: 'minEatingSpeed' },
  { num: 30, title: '30. Find Minimum in Rotated Sorted Array', topic: 'Binary Search', diff: 'Medium', fn: 'findMin' },
  { num: 31, title: '31. Search in Rotated Sorted Array', topic: 'Binary Search', diff: 'Medium', fn: 'search' },
  { num: 32, title: '32. Time Based Key-Value Store', topic: 'Binary Search', diff: 'Medium', fn: 'set' },
  { num: 33, title: '33. Median of Two Sorted Arrays', topic: 'Binary Search', diff: 'Hard', fn: 'findMedianSortedArrays' },

  // LINKED LIST (34 - 46)
  { num: 34, title: '34. Reverse Linked List', topic: 'Linked List', diff: 'Easy', fn: 'reverseList' },
  { num: 35, title: '35. Merge Two Sorted Lists', topic: 'Linked List', diff: 'Easy', fn: 'mergeTwoLists' },
  { num: 36, title: '36. Reorder List', topic: 'Linked List', diff: 'Medium', fn: 'reorderList' },
  { num: 37, title: '37. Remove Nth Node From End of List', topic: 'Linked List', diff: 'Medium', fn: 'removeNthFromEnd' },
  { num: 38, title: '38. Copy List with Random Pointer', topic: 'Linked List', diff: 'Medium', fn: 'copyRandomList' },
  { num: 39, title: '39. Add Two Numbers', topic: 'Linked List', diff: 'Medium', fn: 'addTwoNumbers' },
  { num: 40, title: '40. Linked List Cycle', topic: 'Linked List', diff: 'Easy', fn: 'hasCycle' },
  { num: 41, title: '41. Find the Duplicate Number', topic: 'Linked List', diff: 'Medium', fn: 'findDuplicate' },
  { num: 42, title: '42. LRU Cache', topic: 'Linked List', diff: 'Medium', fn: 'get' },
  { num: 43, title: '43. Merge K Sorted Lists', topic: 'Linked List', diff: 'Hard', fn: 'mergeKLists' },

  // TREES (44 - 58)
  { num: 44, title: '44. Invert Binary Tree', topic: 'Trees', diff: 'Easy', fn: 'invertTree' },
  { num: 45, title: '45. Maximum Depth of Binary Tree', topic: 'Trees', diff: 'Easy', fn: 'maxDepth' },
  { num: 46, title: '46. Diameter of Binary Tree', topic: 'Trees', diff: 'Easy', fn: 'diameterOfBinaryTree' },
  { num: 47, title: '47. Balanced Binary Tree', topic: 'Trees', diff: 'Easy', fn: 'isBalanced' },
  { num: 48, title: '48. Same Tree', topic: 'Trees', diff: 'Easy', fn: 'isSameTree' },
  { num: 49, title: '49. Subtree of Another Tree', topic: 'Trees', diff: 'Easy', fn: 'isSubtree' },
  { num: 50, title: '50. Lowest Common Ancestor of a BST', topic: 'Trees', diff: 'Medium', fn: 'lowestCommonAncestor' },
  { num: 51, title: '51. Binary Tree Level Order Traversal', topic: 'Trees', diff: 'Medium', fn: 'levelOrder' },
  { num: 52, title: '52. Binary Tree Right Side View', topic: 'Trees', diff: 'Medium', fn: 'rightSideView' },
  { num: 53, title: '53. Count Good Nodes in Binary Tree', topic: 'Trees', diff: 'Medium', fn: 'goodNodes' },
  { num: 54, title: '54. Validate Binary Search Tree', topic: 'Trees', diff: 'Medium', fn: 'isValidBST' },
  { num: 55, title: '55. Kth Smallest Element in a BST', topic: 'Trees', diff: 'Medium', fn: 'kthSmallest' },
  { num: 56, title: '56. Construct Binary Tree from Preorder and Inorder Traversal', topic: 'Trees', diff: 'Medium', fn: 'buildTree' },
  { num: 57, title: '57. Binary Tree Maximum Path Sum', topic: 'Trees', diff: 'Hard', fn: 'maxPathSum' },

  // GRAPHS (58 - 71)
  { num: 58, title: '58. Number of Islands', topic: 'Graphs', diff: 'Medium', fn: 'numIslands' },
  { num: 59, title: '59. Max Area of Island', topic: 'Graphs', diff: 'Medium', fn: 'maxAreaOfIsland' },
  { num: 60, title: '60. Clone Graph', topic: 'Graphs', diff: 'Medium', fn: 'cloneGraph' },
  { num: 61, title: '61. Pacific Atlantic Water Flow', topic: 'Graphs', diff: 'Medium', fn: 'pacificAtlantic' },
  { num: 62, title: '62. Surrounded Regions', topic: 'Graphs', diff: 'Medium', fn: 'solve' },
  { num: 63, title: '63. Rotting Oranges', topic: 'Graphs', diff: 'Medium', fn: 'orangesRotting' },
  { num: 64, title: '64. Course Schedule', topic: 'Graphs', diff: 'Medium', fn: 'canFinish' },
  { num: 65, title: '65. Course Schedule II', topic: 'Graphs', diff: 'Medium', fn: 'findOrder' },
  { num: 66, title: '66. Redundant Connection', topic: 'Graphs', diff: 'Medium', fn: 'findRedundantConnection' },
  { num: 67, title: '67. Word Ladder', topic: 'Graphs', diff: 'Hard', fn: 'ladderLength' },

  // DYNAMIC PROGRAMMING & GREEDY (68 - 100)
  { num: 68, title: '68. Climbing Stairs', topic: 'Dynamic Programming', diff: 'Easy', fn: 'climbStairs' },
  { num: 69, title: '69. Min Cost Climbing Stairs', topic: 'Dynamic Programming', diff: 'Easy', fn: 'minCostClimbingStairs' },
  { num: 70, title: '70. House Robber', topic: 'Dynamic Programming', diff: 'Medium', fn: 'rob' },
  { num: 71, title: '71. House Robber II', topic: 'Dynamic Programming', diff: 'Medium', fn: 'rob' },
  { num: 72, title: '72. Longest Palindromic Substring', topic: 'Dynamic Programming', diff: 'Medium', fn: 'longestPalindrome' },
  { num: 73, title: '73. Palindromic Substrings', topic: 'Dynamic Programming', diff: 'Medium', fn: 'countSubstrings' },
  { num: 74, title: '74. Decode Ways', topic: 'Dynamic Programming', diff: 'Medium', fn: 'numDecodings' },
  { num: 75, title: '75. Coin Change', topic: 'Dynamic Programming', diff: 'Medium', fn: 'coinChange' },
  { num: 76, title: '76. Maximum Product Subarray', topic: 'Dynamic Programming', diff: 'Medium', fn: 'maxProduct' },
  { num: 77, title: '77. Word Break', topic: 'Dynamic Programming', diff: 'Medium', fn: 'wordBreak' },
  { num: 78, title: '78. Longest Increasing Subsequence', topic: 'Dynamic Programming', diff: 'Medium', fn: 'lengthOfLIS' },
  { num: 79, title: '79. Partition Equal Subset Sum', topic: 'Dynamic Programming', diff: 'Medium', fn: 'canPartition' },
  { num: 80, title: '80. Unique Paths', topic: 'Dynamic Programming', diff: 'Medium', fn: 'uniquePaths' },
  { num: 81, title: '81. Longest Common Subsequence', topic: 'Dynamic Programming', diff: 'Medium', fn: 'longestCommonSubsequence' },
  { num: 82, title: '82. Best Time to Buy and Sell Stock with Cooldown', topic: 'Dynamic Programming', diff: 'Medium', fn: 'maxProfit' },
  { num: 83, title: '83. Coin Change II', topic: 'Dynamic Programming', diff: 'Medium', fn: 'change' },
  { num: 84, title: '84. Target Sum', topic: 'Dynamic Programming', diff: 'Medium', fn: 'findTargetSumWays' },
  { num: 85, title: '85. Edit Distance', topic: 'Dynamic Programming', diff: 'Hard', fn: 'minDistance' },
  { num: 86, title: '86. Maximum Subarray (Kadane\'s Algorithm)', topic: 'Dynamic Programming', diff: 'Medium', fn: 'maxSubArray' },
  { num: 87, title: '87. Jump Game', topic: 'Dynamic Programming', diff: 'Medium', fn: 'canJump' },
  { num: 88, title: '88. Jump Game II', topic: 'Dynamic Programming', diff: 'Medium', fn: 'jump' },
  { num: 89, title: '89. Gas Station', topic: 'Dynamic Programming', diff: 'Medium', fn: 'canCompleteCircuit' },
  { num: 90, title: '90. Hand of Straights', topic: 'Dynamic Programming', diff: 'Medium', fn: 'isNStraightHand' },
  { num: 91, title: '91. Merge Triplets to Form Target Triplet', topic: 'Dynamic Programming', diff: 'Medium', fn: 'mergeTriplets' },
  { num: 92, title: '92. Partition Labels', topic: 'Dynamic Programming', diff: 'Medium', fn: 'partitionLabels' },
  { num: 93, title: '93. Valid Parenthesis String', topic: 'Dynamic Programming', diff: 'Medium', fn: 'checkValidString' },
  { num: 94, title: '94. Subsets', topic: 'Dynamic Programming', diff: 'Medium', fn: 'subsets' },
  { num: 95, title: '95. Combination Sum', topic: 'Dynamic Programming', diff: 'Medium', fn: 'combinationSum' },
  { num: 96, title: '96. Permutations', topic: 'Dynamic Programming', diff: 'Medium', fn: 'permute' },
  { num: 97, title: '97. Word Search', topic: 'Dynamic Programming', diff: 'Medium', fn: 'exist' },
  { num: 98, title: '98. Palindrome Partitioning', topic: 'Dynamic Programming', diff: 'Medium', fn: 'partition' },
  { num: 99, title: '99. N-Queens', topic: 'Dynamic Programming', diff: 'Hard', fn: 'solveNQueens' },
  { num: 100, title: '100. Letter Combinations of a Phone Number', topic: 'Dynamic Programming', diff: 'Medium', fn: 'letterCombinations' }
];

console.log(`Configured ${TOP100_LIST.length} distinct DSA questions.`);
