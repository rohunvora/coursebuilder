#!/bin/bash

# Course Builder v1.2 - Test Scripts
# Run these with curl to test all functionality

API_URL="http://localhost:3000"

echo "🧪 Course Builder v1.2 - Test Suite"
echo "=================================="

# Test 1: Health Check
echo -e "\n📍 Test 1: Health Check"
curl -s "$API_URL/api/health" | python3 -m json.tool

# Test 2: Create User
echo -e "\n📍 Test 2: Create User"
USER_RESPONSE=$(curl -s -X POST "$API_URL/api/user")
echo "$USER_RESPONSE" | python3 -m json.tool
USER_ID=$(echo "$USER_RESPONSE" | python3 -c "import json,sys;print(json.load(sys.stdin)['id'])")
echo "Created user: $USER_ID"

# Test 3: Generate Course
echo -e "\n📍 Test 3: Generate Course (Stoic Philosophy)"
COURSE_RESPONSE=$(curl -s -X POST "$API_URL/api/course/generate" \
  -H "Content-Type: application/json" \
  -d '{"topic":"Stoic Philosophy"}')
echo "$COURSE_RESPONSE" | python3 -m json.tool

# Test 4: Get Course
echo -e "\n📍 Test 4: Get Predefined Course"
curl -s "$API_URL/api/course/course-stoic-123" | python3 -m json.tool

# Test 5: Submit Answer (Correct)
echo -e "\n📍 Test 5: Submit Correct Answer with High Confidence"
curl -s -X POST "$API_URL/api/answer" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"skillId\": \"skill-1\",
    \"answer\": 1,
    \"confidence\": 5,
    \"correct\": true
  }" | python3 -m json.tool

# Test 6: Submit Answer (Incorrect)
echo -e "\n📍 Test 6: Submit Incorrect Answer with Low Confidence"
curl -s -X POST "$API_URL/api/answer" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"skillId\": \"skill-2\",
    \"answer\": 0,
    \"confidence\": 2,
    \"correct\": false
  }" | python3 -m json.tool

# Test 7: Get User Progress
echo -e "\n📍 Test 7: Get User Progress"
curl -s "$API_URL/api/user/$USER_ID" | python3 -m json.tool

# Test 8: Get Analytics
echo -e "\n📍 Test 8: Get Learning Analytics"
curl -s "$API_URL/api/analytics/$USER_ID" | python3 -m json.tool

echo -e "\n✅ Test suite completed!"