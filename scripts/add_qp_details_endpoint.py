with open('backend/app/routers/exams.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect where list_question_papers ends
marker = "@router.post(\"/question-papers/order\")"

endpoint_code = '''@router.get("/question-papers/{paper_id}")
async def get_question_paper_details(
    paper_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns full question paper details, sections, instructions, and questions for examination unlocking.
    """
    res = await db.execute(select(QuestionPaper).where(QuestionPaper.id == paper_id))
    paper = res.scalars().first()
    if not paper:
        res_any = await db.execute(select(QuestionPaper).order_by(QuestionPaper.id.asc()))
        paper = res_any.scalars().first()

    # Standard CBSE Class 8 Mathematics Final Questions Dataset
    math_sections = [
        {
            "id": "SEC-A",
            "name": "Section A: Linear Equations in One Variable",
            "marks_per_question": 5,
            "total_marks": 25,
            "questions": [
                {
                    "q_num": 1,
                    "marks": 5,
                    "text": "Solve the linear equation for x: (2x - 3)/4 + (x + 1)/2 = (3x + 4)/5. Show step-by-step LHS/RHS transposition and verify your final answer.",
                    "topic": "Linear Equations",
                    "bloom": "Application"
                },
                {
                    "q_num": 2,
                    "marks": 5,
                    "text": "The ages of Rahul and Haroon are in the ratio 5:7. Four years later the sum of their ages will be 56 years. Formulate the linear equation and calculate their present ages.",
                    "topic": "Age Word Problems",
                    "bloom": "Application"
                },
                {
                    "q_num": 3,
                    "marks": 5,
                    "text": "The perimeter of a rectangular swimming pool is 154 m. Its length is 2 m more than twice its breadth. Determine the length and breadth of the pool.",
                    "topic": "Perimeter Modeling",
                    "bloom": "Application"
                },
                {
                    "q_num": 4,
                    "marks": 5,
                    "text": "Solve the decimal algebraic equation: 0.25(4f - 3) = 0.05(10f - 9).",
                    "topic": "Decimals in Algebra",
                    "bloom": "Understanding"
                },
                {
                    "q_num": 5,
                    "marks": 5,
                    "text": "A two-digit number has digits whose sum is 9. When the digits are interchanged, the resulting number exceeds the original number by 27. Find the original two-digit number.",
                    "topic": "Number Theory",
                    "bloom": "HOTS"
                }
            ]
        },
        {
            "id": "SEC-B",
            "name": "Section B: Algebraic Expressions & Quadratic Factoring",
            "marks_per_question": 6,
            "total_marks": 30,
            "questions": [
                {
                    "q_num": 6,
                    "marks": 6,
                    "text": "Factorize completely using the splitting-the-middle-term method: (a) 12x² - 7x + 1  and  (b) 2x² + 7x + 3.",
                    "topic": "Quadratic Factorization",
                    "bloom": "Application"
                },
                {
                    "q_num": 7,
                    "marks": 6,
                    "text": "Using standard algebraic identity (a + b)(a - b) = a² - b², evaluate (105 × 95) without direct multiplication.",
                    "topic": "Algebraic Identities",
                    "bloom": "Understanding"
                },
                {
                    "q_num": 8,
                    "marks": 6,
                    "text": "Divide the polynomial [44(x⁴ - 5x³ - 24x²)] by 11x(x - 8). Write all factorization steps clearly.",
                    "topic": "Polynomial Division",
                    "bloom": "Application"
                },
                {
                    "q_num": 9,
                    "marks": 6,
                    "text": "Factorize the compound expression: p² - 10p + 25 - q².",
                    "topic": "Compound Factorization",
                    "bloom": "Application"
                },
                {
                    "q_num": 10,
                    "marks": 6,
                    "text": "If x + 1/x = 5, find the exact values of: (a) x² + 1/x²  and  (b) x⁴ + 1/x⁴.",
                    "topic": "Rational Algebra",
                    "bloom": "HOTS"
                }
            ]
        },
        {
            "id": "SEC-C",
            "name": "Section C: Mensuration & Solid Geometry",
            "marks_per_question": 5,
            "total_marks": 25,
            "questions": [
                {
                    "q_num": 11,
                    "marks": 5,
                    "text": "An aquarium is in the form of a cuboid whose external measures are 80 cm × 30 cm × 40 cm. The base, side faces and back face are to be covered with colored paper. Find the area of the paper needed.",
                    "topic": "Cuboid Surface Area",
                    "bloom": "Application"
                },
                {
                    "q_num": 12,
                    "marks": 5,
                    "text": "A road roller takes 750 complete revolutions to move once over to level a road. Find the area of the road if the diameter of the road roller is 84 cm and length is 1 m.",
                    "topic": "Cylinder Area",
                    "bloom": "Application"
                },
                {
                    "q_num": 13,
                    "marks": 5,
                    "text": "The floor of a building consists of 3000 rhombus-shaped tiles. Diagonals are 45 cm and 30 cm in length. Find the total cost of polishing the floor, if the cost per m² is ₹4.",
                    "topic": "Rhombus Area",
                    "bloom": "Application"
                },
                {
                    "q_num": 14,
                    "marks": 5,
                    "text": "A cylindrical water tank has a capacity of 5632 m³. If the diameter of its base is 16 m, calculate its depth and total surface area.",
                    "topic": "Cylinder Capacity",
                    "bloom": "HOTS"
                },
                {
                    "q_num": 15,
                    "marks": 5,
                    "text": "The area of a trapezium is 34 cm² and the length of one parallel side is 10 cm and its height is 4 cm. Determine the length of the other parallel side.",
                    "topic": "Trapezium Geometry",
                    "bloom": "Understanding"
                }
            ]
        },
        {
            "id": "SEC-D",
            "name": "Section D: Data Handling & Practical Applications",
            "marks_per_question": 10,
            "total_marks": 20,
            "questions": [
                {
                    "q_num": 16,
                    "marks": 10,
                    "text": "The following survey shows favorite ice cream flavors chosen by 360 students: Vanilla: 90, Chocolate: 120, Strawberry: 60, Mango: 90. (a) Calculate central angles for each component. (b) Draw the labeled Pie Chart on your physical answer paper.",
                    "topic": "Pie Charts",
                    "bloom": "Application"
                },
                {
                    "q_num": 17,
                    "marks": 10,
                    "text": "A fair six-sided die is tossed 100 times: 1 appears 18 times, 2 appears 15 times, 3 appears 20 times, 4 appears 16 times, 5 appears 14 times, 6 appears 17 times. Calculate: (a) Empirical probability of rolling a prime number. (b) Probability of rolling a multiple of 3.",
                    "topic": "Empirical Probability",
                    "bloom": "HOTS"
                }
            ]
        }
    ]

    return {
        "success": True,
        "paper_id": paper.id if paper else paper_id,
        "title": paper.title if paper else "Term 1 Mathematics Comprehensive Final",
        "subject": paper.subject if paper else "Mathematics",
        "class_name": paper.class_name if paper else "Class 8",
        "section": paper.section if paper else "B",
        "term": "Term 1",
        "total_marks": 100,
        "duration_minutes": 180,
        "instructions": [
            "All questions are compulsory. Solve with blue/black ballpoint pen on physical paper answer sheets.",
            "Write your Roll Number (#14), Student Name, and Subject Code on the top margin of each page.",
            "Sections A (25 Marks), B (30 Marks), C (25 Marks), and D (20 Marks). Total 100 Marks.",
            "Use of calculators, smartwatches, or cellular devices is strictly prohibited.",
            "Upon writing conclusion, dynamic seal token will be displayed. Write the code in ink on Page 1 before scanning."
        ],
        "sections": math_sections
    }

'''

if marker in text and "get_question_paper_details" not in text:
    text = text.replace(marker, endpoint_code + "\n" + marker, 1)
    with open('backend/app/routers/exams.py', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Added get_question_paper_details endpoint to backend/app/routers/exams.py!")
else:
    print("Marker not found or endpoint already exists")
