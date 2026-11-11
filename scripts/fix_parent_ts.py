with open('frontend/src/app/parent/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add useMemo to react imports
c = c.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect, useMemo } from 'react';"
)

# 2. Add types to k and kid
c = c.replace(
    "const activeKid = currentParentChildren.find((k) => k.id === activeKidId) || currentParentChildren[0];",
    "const activeKid = currentParentChildren.find((k: ParentChildProfile) => k.id === activeKidId) || currentParentChildren[0];"
)

c = c.replace(
    "currentParentChildren.map((kid) => {",
    "currentParentChildren.map((kid: ParentChildProfile) => {"
)

with open('frontend/src/app/parent/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Fixed TypeScript annotations in parent/page.tsx")
