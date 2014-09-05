ps aux | grep test_crawler | awk '{print $2}' | xargs kill -9
