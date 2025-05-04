--

SELECT gender, CAST(${pressColumn} AS TEXT) AS pressure_label, COUNT(*) AS count
      FROM results
      WHERE ${pressColumn} IS NOT NULL AND depression = 1
      GROUP BY gender, pressure_label
      ORDER BY pressure_label, gender;

--
 SELECT CAST(${pressColumn} AS TEXT) AS pressure_label, COUNT(*) AS count
      FROM results
      WHERE ${pressColumn} IS NOT NULL AND depression = 1
      ${genderCondition}
      GROUP BY pressure_label
      ORDER BY pressure_label;

--
    SELECT have_you_ever_had_suicidal_thoughts AS category, AVG(depression) * 100 AS avg_depression
  FROM results
  WHERE have_you_ever_had_suicidal_thoughts IS NOT NULL AND depression IS NOT NULL
  GROUP BY category;


--
  SELECT family_history_of_mental_illnes AS category, AVG(depression) * 100 AS avg_depression
  FROM results
  WHERE family_history_of_mental_illnes IS NOT NULL AND depression IS NOT NULL
  GROUP BY category;

  --
   SELECT age, 
           AVG(CAST(depression AS FLOAT)) * 100 AS depression_rate
    FROM results
    WHERE sleep_hours BETWEEN ${selectedRange.min} AND ${selectedRange.max}
    GROUP BY age
    ORDER BY age;

    SELECT * FROM results
    GROUP BY category;