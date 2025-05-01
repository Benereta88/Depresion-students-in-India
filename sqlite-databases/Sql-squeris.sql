select gender, age, sleep_duration
 from results
where age > 24 and sleep_duration < 5-6;



SELECT sleep_duration, sleep_hours FROM results LIMIT 10;


   SELECT age, AVG(depression) * 100 AS depression_rate
FROM results
 WHERE sleep_hours = 5.5

GROUP BY age
ORDER BY age;



  SELECT DISTINCT sleep_duration FROM results;
