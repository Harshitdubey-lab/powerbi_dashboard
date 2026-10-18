// Preloaded rich sample datasets for instant testing and demonstration

export const SAMPLE_DATASETS = {
  sales: {
    name: "Global E-Commerce Sales 2024",
    purpose: "Sales Analysis",
    description: "Multi-region retail orders including categories, revenue, profit margins, and customer ratings.",
    data: [
      { Order_ID: "ORD-1001", Date: "2024-01-05", Region: "North America", Category: "Electronics", Product: "Wireless Noise-Canceling Headphones", Units_Sold: 14, Unit_Price: 199.99, Revenue: 2799.86, Profit: 840.00, Discount_Pct: 5, Payment_Method: "Credit Card", Customer_Rating: 4.8 },
      { Order_ID: "ORD-1002", Date: "2024-01-08", Region: "Europe", Category: "Home Appliances", Product: "Smart Robotic Vacuum", Units_Sold: 8, Unit_Price: 349.50, Revenue: 2796.00, Profit: 699.00, Discount_Pct: 10, Payment_Method: "PayPal", Customer_Rating: 4.5 },
      { Order_ID: "ORD-1003", Date: "2024-01-12", Region: "Asia-Pacific", Category: "Electronics", Product: "Ultra HD 4K Monitor", Units_Sold: 22, Unit_Price: 420.00, Revenue: 9240.00, Profit: 2310.00, Discount_Pct: 8, Payment_Method: "Credit Card", Customer_Rating: 4.9 },
      { Order_ID: "ORD-1004", Date: "2024-01-15", Region: "Latin America", Category: "Furniture", Product: "Ergonomic Mesh Office Chair", Units_Sold: 12, Unit_Price: 210.00, Revenue: 2520.00, Profit: 504.00, Discount_Pct: 0, Payment_Method: "Bank Transfer", Customer_Rating: 4.2 },
      { Order_ID: "ORD-1005", Date: "2024-01-19", Region: "North America", Category: "Office Supplies", Product: "Premium Laser Toner Pack", Units_Sold: 45, Unit_Price: 65.00, Revenue: 2925.00, Profit: 1170.00, Discount_Pct: 12, Payment_Method: "Credit Card", Customer_Rating: 4.6 },
      { Order_ID: "ORD-1006", Date: "2024-01-23", Region: "Europe", Category: "Electronics", Product: "Mechanical RGB Keyboard", Units_Sold: 35, Unit_Price: 129.99, Revenue: 4549.65, Profit: 1592.38, Discount_Pct: 15, Payment_Method: "PayPal", Customer_Rating: 4.7 },
      { Order_ID: "ORD-1007", Date: "2024-01-27", Region: "Asia-Pacific", Category: "Furniture", Product: "Standing Motorized Desk", Units_Sold: 9, Unit_Price: 580.00, Revenue: 5220.00, Profit: 1305.00, Discount_Pct: 5, Payment_Method: "Credit Card", Customer_Rating: 4.4 },
      { Order_ID: "ORD-1008", Date: "2024-02-02", Region: "North America", Category: "Home Appliances", Product: "Air Purifier Pro Max", Units_Sold: 18, Unit_Price: 185.00, Revenue: 3330.00, Profit: 832.50, Discount_Pct: 10, Payment_Method: "Debit Card", Customer_Rating: 4.3 },
      { Order_ID: "ORD-1009", Date: "2024-02-06", Region: "Europe", Category: "Electronics", Product: "Bluetooth Conference Speaker", Units_Sold: 16, Unit_Price: 150.00, Revenue: 2400.00, Profit: 720.00, Discount_Pct: 0, Payment_Method: "Credit Card", Customer_Rating: 4.6 },
      { Order_ID: "ORD-1010", Date: "2024-02-10", Region: "Latin America", Category: "Office Supplies", Product: "A4 Multi-Purpose Paper (Box)", Units_Sold: 80, Unit_Price: 32.00, Revenue: 2560.00, Profit: 768.00, Discount_Pct: 5, Payment_Method: "Bank Transfer", Customer_Rating: 4.1 },
      { Order_ID: "ORD-1011", Date: "2024-02-15", Region: "Asia-Pacific", Category: "Electronics", Product: "Wireless Noise-Canceling Headphones", Units_Sold: 28, Unit_Price: 199.99, Revenue: 5599.72, Profit: 1679.92, Discount_Pct: 10, Payment_Method: "PayPal", Customer_Rating: 4.9 },
      { Order_ID: "ORD-1012", Date: "2024-02-20", Region: "North America", Category: "Furniture", Product: "Ergonomic Mesh Office Chair", Units_Sold: 24, Unit_Price: 210.00, Revenue: 5040.00, Profit: 1008.00, Discount_Pct: 5, Payment_Method: "Credit Card", Customer_Rating: 4.5 },
      { Order_ID: "ORD-1013", Date: "2024-02-24", Region: "Europe", Category: "Office Supplies", Product: "Heavy Duty Shredder", Units_Sold: 11, Unit_Price: 240.00, Revenue: 2640.00, Profit: 792.00, Discount_Pct: 8, Payment_Method: "Credit Card", Customer_Rating: 4.2 },
      { Order_ID: "ORD-1014", Date: "2024-03-01", Region: "Asia-Pacific", Category: "Home Appliances", Product: "Smart Robotic Vacuum", Units_Sold: 15, Unit_Price: 349.50, Revenue: 5242.50, Profit: 1310.63, Discount_Pct: 12, Payment_Method: "PayPal", Customer_Rating: 4.7 },
      { Order_ID: "ORD-1015", Date: "2024-03-05", Region: "North America", Category: "Electronics", Product: "Ultra HD 4K Monitor", Units_Sold: 30, Unit_Price: 420.00, Revenue: 12600.00, Profit: 3150.00, Discount_Pct: 10, Payment_Method: "Credit Card", Customer_Rating: 4.9 },
      { Order_ID: "ORD-1016", Date: "2024-03-10", Region: "Latin America", Category: "Home Appliances", Product: "Air Purifier Pro Max", Units_Sold: 10, Unit_Price: 185.00, Revenue: 1850.00, Profit: 462.50, Discount_Pct: 0, Payment_Method: "Bank Transfer", Customer_Rating: 4.0 },
      { Order_ID: "ORD-1017", Date: "2024-03-14", Region: "Europe", Category: "Furniture", Product: "Standing Motorized Desk", Units_Sold: 14, Unit_Price: 580.00, Revenue: 8120.00, Profit: 2030.00, Discount_Pct: 6, Payment_Method: "Credit Card", Customer_Rating: 4.8 },
      { Order_ID: "ORD-1018", Date: "2024-03-18", Region: "North America", Category: "Electronics", Product: "Mechanical RGB Keyboard", Units_Sold: 42, Unit_Price: 129.99, Revenue: 5459.58, Profit: 1910.85, Discount_Pct: 15, Payment_Method: "PayPal", Customer_Rating: 4.6 },
      { Order_ID: "ORD-1019", Date: "2024-03-22", Region: "Asia-Pacific", Category: "Office Supplies", Product: "Premium Laser Toner Pack", Units_Sold: 60, Unit_Price: 65.00, Revenue: 3900.00, Profit: 1560.00, Discount_Pct: 10, Payment_Method: "Credit Card", Customer_Rating: 4.7 },
      { Order_ID: "ORD-1020", Date: "2024-03-28", Region: "Latin America", Category: "Electronics", Product: "Bluetooth Conference Speaker", Units_Sold: 13, Unit_Price: 150.00, Revenue: 1950.00, Profit: 585.00, Discount_Pct: 5, Payment_Method: "Debit Card", Customer_Rating: 4.4 },
      // Duplicate entry for data cleaning showcase
      { Order_ID: "ORD-1020", Date: "2024-03-28", Region: "Latin America", Category: "Electronics", Product: "Bluetooth Conference Speaker", Units_Sold: 13, Unit_Price: 150.00, Revenue: 1950.00, Profit: 585.00, Discount_Pct: 5, Payment_Method: "Debit Card", Customer_Rating: 4.4 },
      { Order_ID: "ORD-1021", Date: "2024-04-02", Region: "North America", Category: "Electronics", Product: "Ultra HD 4K Monitor", Units_Sold: 19, Unit_Price: 420.00, Revenue: 7980.00, Profit: 1995.00, Discount_Pct: 8, Payment_Method: "Credit Card", Customer_Rating: 4.9 },
      { Order_ID: "ORD-1022", Date: "2024-04-07", Region: "Europe", Category: "Home Appliances", Product: "Smart Robotic Vacuum", Units_Sold: 12, Unit_Price: 349.50, Revenue: 4194.00, Profit: 1048.50, Discount_Pct: 5, Payment_Method: "PayPal", Customer_Rating: 4.6 },
      { Order_ID: "ORD-1023", Date: "2024-04-12", Region: "Asia-Pacific", Category: "Furniture", Product: "Ergonomic Mesh Office Chair", Units_Sold: 31, Unit_Price: 210.00, Revenue: 6510.00, Profit: 1302.00, Discount_Pct: 10, Payment_Method: "Credit Card", Customer_Rating: 4.5 },
      { Order_ID: "ORD-1024", Date: "2024-04-18", Region: "North America", Category: "Office Supplies", Product: "A4 Multi-Purpose Paper (Box)", Units_Sold: 95, Unit_Price: 32.00, Revenue: 3040.00, Profit: 912.00, Discount_Pct: 10, Payment_Method: "Credit Card", Customer_Rating: 4.3 }
    ]
  },
  student: {
    name: "Student Academic Performance 2024",
    purpose: "Student Performance",
    description: "Student exam marks, attendance rates, study hours, and passing status across various academic subjects.",
    data: [
      { Student_ID: "STU-01", Grade: "Grade 11", Gender: "Female", Subject: "Computer Science", Attendance_Rate: 96, Homework_Score: 92, Midterm_Score: 88, Final_Exam: 94, Total_Score: 91.5, Study_Hours_Weekly: 14, Status: "Passed" },
      { Student_ID: "STU-02", Grade: "Grade 11", Gender: "Male", Subject: "Mathematics", Attendance_Rate: 88, Homework_Score: 78, Midterm_Score: 82, Final_Exam: 85, Total_Score: 82.0, Study_Hours_Weekly: 10, Status: "Passed" },
      { Student_ID: "STU-03", Grade: "Grade 12", Gender: "Female", Subject: "Physics", Attendance_Rate: 92, Homework_Score: 85, Midterm_Score: 90, Final_Exam: 89, Total_Score: 88.5, Study_Hours_Weekly: 12, Status: "Passed" },
      { Student_ID: "STU-04", Grade: "Grade 10", Gender: "Male", Subject: "Chemistry", Attendance_Rate: 74, Homework_Score: 60, Midterm_Score: 65, Final_Exam: 58, Total_Score: 60.5, Study_Hours_Weekly: 6, Status: "Needs Attention" },
      { Student_ID: "STU-05", Grade: "Grade 12", Gender: "Female", Subject: "Computer Science", Attendance_Rate: 98, Homework_Score: 98, Midterm_Score: 95, Final_Exam: 99, Total_Score: 97.5, Study_Hours_Weekly: 16, Status: "Passed" },
      { Student_ID: "STU-06", Grade: "Grade 10", Gender: "Male", Subject: "English Literature", Attendance_Rate: 82, Homework_Score: 75, Midterm_Score: 70, Final_Exam: 74, Total_Score: 73.0, Study_Hours_Weekly: 8, Status: "Passed" },
      { Student_ID: "STU-07", Grade: "Grade 11", Gender: "Female", Subject: "Biology", Attendance_Rate: 90, Homework_Score: 88, Midterm_Score: 84, Final_Exam: 91, Total_Score: 88.0, Study_Hours_Weekly: 11, Status: "Passed" },
      { Student_ID: "STU-08", Grade: "Grade 12", Gender: "Male", Subject: "Mathematics", Attendance_Rate: 68, Homework_Score: 50, Midterm_Score: 55, Final_Exam: 49, Total_Score: 51.5, Study_Hours_Weekly: 4, Status: "Failed" },
      { Student_ID: "STU-09", Grade: "Grade 10", Gender: "Female", Subject: "Physics", Attendance_Rate: 94, Homework_Score: 90, Midterm_Score: 92, Final_Exam: 95, Total_Score: 93.0, Study_Hours_Weekly: 13, Status: "Passed" },
      { Student_ID: "STU-10", Grade: "Grade 11", Gender: "Male", Subject: "Chemistry", Attendance_Rate: 85, Homework_Score: 80, Midterm_Score: 78, Final_Exam: 82, Total_Score: 80.0, Study_Hours_Weekly: 9, Status: "Passed" },
      { Student_ID: "STU-11", Grade: "Grade 12", Gender: "Female", Subject: "Mathematics", Attendance_Rate: 95, Homework_Score: 94, Midterm_Score: 91, Final_Exam: 96, Total_Score: 94.0, Study_Hours_Weekly: 15, Status: "Passed" },
      { Student_ID: "STU-12", Grade: "Grade 10", Gender: "Male", Subject: "Computer Science", Attendance_Rate: 89, Homework_Score: 86, Midterm_Score: 88, Final_Exam: 87, Total_Score: 87.0, Study_Hours_Weekly: 11, Status: "Passed" },
      { Student_ID: "STU-13", Grade: "Grade 11", Gender: "Female", Subject: "English Literature", Attendance_Rate: 91, Homework_Score: 89, Midterm_Score: 86, Final_Exam: 90, Total_Score: 88.5, Study_Hours_Weekly: 10, Status: "Passed" },
      { Student_ID: "STU-14", Grade: "Grade 12", Gender: "Male", Subject: "Biology", Attendance_Rate: 72, Homework_Score: 62, Midterm_Score: 68, Final_Exam: 64, Total_Score: 65.0, Study_Hours_Weekly: 5, Status: "Needs Attention" },
      { Student_ID: "STU-15", Grade: "Grade 10", Gender: "Female", Subject: "Mathematics", Attendance_Rate: 97, Homework_Score: 96, Midterm_Score: 94, Final_Exam: 98, Total_Score: 96.5, Study_Hours_Weekly: 16, Status: "Passed" }
    ]
  },
  finance: {
    name: "Corporate Financial Budget 2024",
    purpose: "Finance",
    description: "Departmental expenditure, budget allocations, variance margins, and project ROI tracking.",
    data: [
      { Quarter: "Q1", Department: "Engineering", Cost_Center: "Software Dev", Budget: 250000, Actual_Spend: 238000, Variance: 12000, Variance_Pct: 4.8, Headcount: 42, ROI_Score: 8.9 },
      { Quarter: "Q1", Department: "Marketing", Cost_Center: "Digital Ads", Budget: 180000, Actual_Spend: 192000, Variance: -12000, Variance_Pct: -6.7, Headcount: 18, ROI_Score: 7.4 },
      { Quarter: "Q1", Department: "Sales", Cost_Center: "Client Acquisition", Budget: 210000, Actual_Spend: 205000, Variance: 5000, Variance_Pct: 2.4, Headcount: 28, ROI_Score: 9.1 },
      { Quarter: "Q1", Department: "Operations", Cost_Center: "Facilities & Cloud", Budget: 140000, Actual_Spend: 135000, Variance: 5000, Variance_Pct: 3.6, Headcount: 14, ROI_Score: 6.8 },
      { Quarter: "Q2", Department: "Engineering", Cost_Center: "Software Dev", Budget: 275000, Actual_Spend: 268000, Variance: 7000, Variance_Pct: 2.5, Headcount: 46, ROI_Score: 9.2 },
      { Quarter: "Q2", Department: "Marketing", Cost_Center: "Digital Ads", Budget: 200000, Actual_Spend: 198000, Variance: 2000, Variance_Pct: 1.0, Headcount: 20, ROI_Score: 8.2 },
      { Quarter: "Q2", Department: "Sales", Cost_Center: "Client Acquisition", Budget: 230000, Actual_Spend: 241000, Variance: -11000, Variance_Pct: -4.8, Headcount: 32, ROI_Score: 8.8 },
      { Quarter: "Q2", Department: "Operations", Cost_Center: "Facilities & Cloud", Budget: 150000, Actual_Spend: 147000, Variance: 3000, Variance_Pct: 2.0, Headcount: 15, ROI_Score: 7.0 },
      { Quarter: "Q3", Department: "Engineering", Cost_Center: "Software Dev", Budget: 290000, Actual_Spend: 284000, Variance: 6000, Variance_Pct: 2.1, Headcount: 50, ROI_Score: 9.5 },
      { Quarter: "Q3", Department: "Marketing", Cost_Center: "Digital Ads", Budget: 220000, Actual_Spend: 215000, Variance: 5000, Variance_Pct: 2.3, Headcount: 22, ROI_Score: 8.5 },
      { Quarter: "Q3", Department: "Sales", Cost_Center: "Client Acquisition", Budget: 250000, Actual_Spend: 245000, Variance: 5000, Variance_Pct: 2.0, Headcount: 35, ROI_Score: 9.3 },
      { Quarter: "Q3", Department: "Operations", Cost_Center: "Facilities & Cloud", Budget: 160000, Actual_Spend: 159000, Variance: 1000, Variance_Pct: 0.6, Headcount: 16, ROI_Score: 7.2 }
    ]
  },
  health: {
    name: "Hospital Clinical Operations & Patient Metrics",
    purpose: "Health",
    description: "Patient hospital stays, department loads, admission diagnostics, treatment expenses, and satisfaction scores.",
    data: [
      { Patient_ID: "PT-101", Department: "Cardiology", Age_Group: "60+", Admission_Type: "Emergency", Stay_Days: 6, Treatment_Cost: 14500, Insurance: "Medicare", Outcome: "Recovered", Satisfaction: 4.7 },
      { Patient_ID: "PT-102", Department: "Orthopedics", Age_Group: "40-59", Admission_Type: "Elective", Stay_Days: 3, Treatment_Cost: 8200, Insurance: "BlueCross", Outcome: "Recovered", Satisfaction: 4.9 },
      { Patient_ID: "PT-103", Department: "Pediatrics", Age_Group: "0-18", Admission_Type: "Urgent", Stay_Days: 2, Treatment_Cost: 3100, Insurance: "UnitedHealth", Outcome: "Recovered", Satisfaction: 4.8 },
      { Patient_ID: "PT-104", Department: "Neurology", Age_Group: "60+", Admission_Type: "Emergency", Stay_Days: 9, Treatment_Cost: 22000, Insurance: "Aetna", Outcome: "Observation", Satisfaction: 4.2 },
      { Patient_ID: "PT-105", Department: "General Surgery", Age_Group: "19-39", Admission_Type: "Elective", Stay_Days: 4, Treatment_Cost: 9500, Insurance: "Cigna", Outcome: "Recovered", Satisfaction: 4.6 },
      { Patient_ID: "PT-106", Department: "Cardiology", Age_Group: "40-59", Admission_Type: "Emergency", Stay_Days: 5, Treatment_Cost: 12800, Insurance: "BlueCross", Outcome: "Recovered", Satisfaction: 4.5 },
      { Patient_ID: "PT-107", Department: "Orthopedics", Age_Group: "60+", Admission_Type: "Elective", Stay_Days: 5, Treatment_Cost: 11200, Insurance: "Medicare", Outcome: "Recovered", Satisfaction: 4.4 },
      { Patient_ID: "PT-108", Department: "Pediatrics", Age_Group: "0-18", Admission_Type: "Emergency", Stay_Days: 3, Treatment_Cost: 4500, Insurance: "Medicaid", Outcome: "Recovered", Satisfaction: 4.9 },
      { Patient_ID: "PT-109", Department: "Neurology", Age_Group: "40-59", Admission_Type: "Urgent", Stay_Days: 7, Treatment_Cost: 17800, Insurance: "Aetna", Outcome: "Recovered", Satisfaction: 4.3 },
      { Patient_ID: "PT-110", Department: "General Surgery", Age_Group: "60+", Admission_Type: "Emergency", Stay_Days: 8, Treatment_Cost: 16500, Insurance: "Medicare", Outcome: "Observation", Satisfaction: 4.1 }
    ]
  }
};
