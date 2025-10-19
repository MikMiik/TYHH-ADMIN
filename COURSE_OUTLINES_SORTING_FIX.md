# Fix: Course Outlines Sorting by Order Field

## 🐛 Problem
Course outlines were not displaying in the correct order on the course detail page. The backend was returning outlines with an `order` field, but the frontend was rendering them in the order received from the API without sorting.

## 📊 Example Data from Backend
```json
"outlines": [
    {
        "id": 7,
        "title": "NGÂN HÀNG CÂU HỎI LÝ THUYẾT HÓA 12",
        "slug": "ngan-hang-cau-hoi-ly-thuyet-hoa-12-1",
        "order": 2
    },
    {
        "id": 8,
        "title": "NGÂN HÀNG CÂU HỎI LÝ THUYẾT HÓA 111",
        "slug": "ngan-hang-cau-hoi-ly-thuyet-hoa-111",
        "order": 1
    },
    {
        "id": 9,
        "title": "NGÂN HÀNG CÂU HỎI LÝ THUYẾT HÓA 10",
        "slug": "ngan-hang-cau-hoi-ly-thuyet-hoa-10",
        "order": 3
    },
    {
        "id": 16,
        "title": "hfhgffdgfh",
        "slug": "hfhgffdgfh",
        "order": 4
    }
]
```

**Expected Display Order:** 111 → 12 → 10 → hfhgffdgfh (by order: 1, 2, 3, 4)
**Actual Display Order:** 12 → 111 → 10 → hfhgffdgfh (as returned from API)

## ✅ Solution

### 1. Added `useMemo` import
```typescript
import { useState, useMemo } from "react";
```

### 2. Created sorted outlines with `useMemo`
```typescript
// Sort course outlines by order field
const sortedOutlines = useMemo(() => {
  if (!course?.outlines) return [];
  return [...course.outlines].sort((a, b) => (a.order || 0) - (b.order || 0));
}, [course?.outlines]);
```

### 3. Replaced all `course.outlines` usage with `sortedOutlines`

#### In Drag & Drop Handler:
```typescript
// Before
if (!course?.outlines) return;
const oldIndex = course.outlines.findIndex(...);
const newIndex = course.outlines.findIndex(...);
const reorderedOutlines = arrayMove(course.outlines, oldIndex, newIndex);

// After
if (!sortedOutlines || sortedOutlines.length === 0) return;
const oldIndex = sortedOutlines.findIndex(...);
const newIndex = sortedOutlines.findIndex(...);
const reorderedOutlines = arrayMove(sortedOutlines, oldIndex, newIndex);
```

#### In Render Section:
```typescript
// Before
{course.outlines && course.outlines.length > 0 ? (
  <DndContext>
    <SortableContext items={course.outlines.map(...)}>
      {course.outlines.map((outline, index) => (...))}
    </SortableContext>
  </DndContext>
) : (...)}

// After
{sortedOutlines && sortedOutlines.length > 0 ? (
  <DndContext>
    <SortableContext items={sortedOutlines.map(...)}>
      {sortedOutlines.map((outline, index) => (...))}
    </SortableContext>
  </DndContext>
) : (...)}
```

#### In Display Counts:
```typescript
// Before
Course Outlines ({course.outlines?.length || 0})
{course.outlines?.length || 0}

// After
Course Outlines ({sortedOutlines.length})
{sortedOutlines.length}
```

## 🔧 Technical Details

### Why `useMemo`?
- **Performance:** Sorting only happens when `course.outlines` changes
- **Stability:** Prevents unnecessary re-renders and re-sorts
- **Memoization:** Cached sorted array is reused across renders

### Sorting Logic:
```typescript
.sort((a, b) => (a.order || 0) - (b.order || 0))
```
- Sorts in ascending order by `order` field
- Defaults to 0 if `order` is undefined/null
- Creates a new array (spread operator `[...]`) to avoid mutating original data

### Drag & Drop Integration:
The sorted array works seamlessly with drag-and-drop:
1. User drags outline to new position
2. `handleDragEnd` calculates new order based on `sortedOutlines`
3. API updates order in backend
4. `refetch()` triggers data reload
5. `useMemo` re-sorts with new order values
6. UI updates automatically

## ✅ Testing

### Build Status:
```
✓ Compiled successfully
✓ Linting passed
✓ 0 TypeScript errors
✓ Build successful
```

### Expected Behavior:
1. **Initial Load:** Outlines display in order 1, 2, 3, 4...
2. **Drag & Drop:** User can reorder, order updates persist to backend
3. **Refresh:** After reload, outlines maintain new order
4. **Counts:** All outline counts show correct value

## 📝 Files Modified

- `src/app/(dashboard)/courses/[slug]/page.tsx`
  - Added `useMemo` import
  - Created `sortedOutlines` memo
  - Replaced 7 instances of `course.outlines` with `sortedOutlines`
  - Added null check in `handleDragEnd`

## 🎯 Result

✅ Course outlines now display in correct order based on `order` field
✅ Drag & drop reordering still works correctly
✅ Performance optimized with `useMemo`
✅ TypeScript type-safe
✅ No breaking changes to existing functionality

---

**Fixed Date:** 2025-01-XX
**Build Status:** ✅ Success

