select gender, age, sleep_duration
 from results
where age > 24 and sleep_duration < 5-6;


 SELECT age, 
         AVG(CAST(depression AS FLOAT)) * 100 AS depression_rate
  FROM results
  WHERE sleep_duration > 5-6
  GROUP BY age
  ORDER BY age