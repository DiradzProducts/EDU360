with open('frontend/src/lib/api.ts', 'r', encoding='utf-8') as f:
    text = f.read()

target = "  orderQuestionPaper: async (data: any): Promise<{ success: boolean; message: string; paper_id: number }> => {"

method_code = '''  getQuestionPaperDetails: async (paperId: number = 1): Promise<any> => {
    try {
      const res = await fetchWithFallback<any>(`/api/exams/question-papers/${paperId}`);
      if (res && res.sections) return res;
    } catch {}

    // Fallback standard CBSE Class 8 Math Question Paper
    return {
      success: true,
      paper_id: paperId,
      title: "Term 1 Mathematics Comprehensive Final",
      subject: "Mathematics",
      class_name: "Class 8",
      section: "B",
      term: "Term 1",
      total_marks: 100,
      duration_minutes: 180,
      instructions: [
        "All questions are compulsory. Solve on physical paper booklet with blue/black ballpoint pen.",
        "Write your Roll Number (#14), Candidate Name, and Subject Code on the top margin of every page.",
        "Section A (25 Marks), Section B (30 Marks), Section C (25 Marks), Section D (20 Marks). Total 100 Marks.",
        "No calculator, smartwatch, or secondary device permitted.",
        "Upon writing completion, generate dynamic cryptographic seal token and write on Page 1 before scanning."
      ],
      sections: [
        {
          id: "SEC-A",
          name: "Section A: Linear Equations in One Variable",
          marks_per_question: 5,
          total_marks: 25,
          questions: [
            {
              q_num: 1,
              marks: 5,
              text: "Solve the linear equation for x: (2x - 3)/4 + (x + 1)/2 = (3x + 4)/5. Show all transposition steps clearly and verify your answer.",
              topic: "Linear Equations",
              bloom: "Application"
            },
            {
              q_num: 2,
              marks: 5,
              text: "The ages of Rahul and Haroon are in the ratio 5:7. Four years later the sum of their ages will be 56 years. What are their present ages?",
              topic: "Age Word Problems",
              bloom: "Application"
            },
            {
              q_num: 3,
              marks: 5,
              text: "The perimeter of a rectangular swimming pool is 154 m. Its length is 2 m more than twice its breadth. Determine the length and breadth of the pool.",
              topic: "Perimeter Modeling",
              bloom: "Application"
            },
            {
              q_num: 4,
              marks: 5,
              text: "Solve the decimal algebraic equation: 0.25(4f - 3) = 0.05(10f - 9).",
              topic: "Decimals in Algebra",
              bloom: "Understanding"
            },
            {
              q_num: 5,
              marks: 5,
              text: "A two-digit number has digits whose sum is 9. When digits are reversed, the resulting number exceeds original by 27. Find the original number.",
              topic: "Number Theory",
              bloom: "HOTS"
            }
          ]
        },
        {
          id: "SEC-B",
          name: "Section B: Algebraic Expressions & Quadratic Factoring",
          marks_per_question: 6,
          total_marks: 30,
          questions: [
            {
              q_num: 6,
              marks: 6,
              text: "Factorize completely using splitting the middle term: (a) 12x² - 7x + 1  and  (b) 2x² + 7x + 3.",
              topic: "Quadratic Factorization",
              bloom: "Application"
            },
            {
              q_num: 7,
              marks: 6,
              text: "Using standard identity (a + b)(a - b) = a² - b², evaluate (105 × 95) without direct multiplication.",
              topic: "Algebraic Identities",
              bloom: "Understanding"
            },
            {
              q_num: 8,
              marks: 6,
              text: "Divide polynomial [44(x⁴ - 5x³ - 24x²)] by 11x(x - 8). Show all algebraic simplification steps.",
              topic: "Polynomial Division",
              bloom: "Application"
            },
            {
              q_num: 9,
              marks: 6,
              text: "Factorize compound expression: p² - 10p + 25 - q².",
              topic: "Compound Factorization",
              bloom: "Application"
            },
            {
              q_num: 10,
              marks: 6,
              text: "If x + 1/x = 5, find exact values of: (a) x² + 1/x²  and  (b) x⁴ + 1/x⁴.",
              topic: "Rational Algebra",
              bloom: "HOTS"
            }
          ]
        },
        {
          id: "SEC-C",
          name: "Section C: Mensuration & Solid Geometry",
          marks_per_question: 5,
          total_marks: 25,
          questions: [
            {
              q_num: 11,
              marks: 5,
              text: "An aquarium is a cuboid measuring 80 cm × 30 cm × 40 cm. Base, sides and back are covered with paper. Find total paper area needed.",
              topic: "Cuboid Surface Area",
              bloom: "Application"
            },
            {
              q_num: 12,
              marks: 5,
              text: "A road roller takes 750 revolutions to level a road. If diameter is 84 cm and length is 1 m, calculate road surface area.",
              topic: "Cylinder Area",
              bloom: "Application"
            },
            {
              q_num: 13,
              marks: 5,
              text: "A building floor has 3000 rhombus tiles with diagonals 45 cm and 30 cm. Find total polishing cost at ₹4 per m².",
              topic: "Rhombus Area",
              bloom: "Application"
            },
            {
              q_num: 14,
              marks: 5,
              text: "A cylindrical water tank has capacity 5632 m³. Base diameter is 16 m. Calculate its depth and total surface area.",
              topic: "Cylinder Capacity",
              bloom: "HOTS"
            },
            {
              q_num: 15,
              marks: 5,
              text: "Area of a trapezium is 34 cm²; one parallel side is 10 cm and height is 4 cm. Determine length of the other parallel side.",
              topic: "Trapezium Geometry",
              bloom: "Understanding"
            }
          ]
        },
        {
          id: "SEC-D",
          name: "Section D: Data Handling & Practical Applications",
          marks_per_question: 10,
          total_marks: 20,
          questions: [
            {
              q_num: 16,
              marks: 10,
              text: "Survey of 360 students favorite flavors: Vanilla 90, Chocolate 120, Strawberry 60, Mango 90. Calculate central angles and draw labeled Pie Chart.",
              topic: "Pie Charts",
              bloom: "Application"
            },
            {
              q_num: 17,
              marks: 10,
              text: "A die is thrown 100 times: 1:18, 2:15, 3:20, 4:16, 5:14, 6:17. Calculate: (a) Probability of rolling a prime. (b) Probability of rolling a multiple of 3.",
              topic: "Empirical Probability",
              bloom: "HOTS"
            }
          ]
        }
      ]
    };
  },

'''

if target in text and "getQuestionPaperDetails" not in text:
    text = text.replace(target, method_code + target, 1)
    with open('frontend/src/lib/api.ts', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Added getQuestionPaperDetails to api.ts!")
else:
    print("Target not found or already added")
