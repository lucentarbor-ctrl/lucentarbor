/**
 * 카테고리 관리 API - 계층적 카테고리 지원
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - 모든 카테고리 조회 (계층 구조 포함)
export async function GET(req: NextRequest) {
  try {
    const blogId = req.nextUrl.searchParams.get('blog_id');
    const flat = req.nextUrl.searchParams.get('flat') === 'true';

    const where: any = { isActive: true };
    if (blogId) {
      where.blogId = parseInt(blogId);
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: {
        blog: {
          select: {
            id: true,
            name: true,
            platform: true
          }
        },
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    // Flat list (no hierarchy)
    if (flat) {
      const flatCategories = categories.map(cat => ({
        ...cat,
        postCount: cat._count.posts
      }));
      return NextResponse.json({
        success: true,
        categories: flatCategories,
        total: categories.length
      });
    }

    // Build hierarchical structure
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // First pass: create all category objects
    categories.forEach((cat) => {
      categoryMap.set(cat.id, {
        ...cat,
        postCount: cat._count.posts,
        children: []
      });
    });

    // Second pass: build hierarchy
    categories.forEach((cat) => {
      const category = categoryMap.get(cat.id);
      if (cat.parentId === null) {
        rootCategories.push(category);
      } else {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(category);
        } else {
          // Parent not found, treat as root
          rootCategories.push(category);
        }
      }
    });

    return NextResponse.json({
      success: true,
      categories: rootCategories,
      total: categories.length
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', message: error.message },
      { status: 500 }
    );
  }
}

// POST - 새 카테고리 생성
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, parentId, blogId, order } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description || null,
        parentId: parentId || null,
        blogId: blogId || null,
        order: order || 0,
        isActive: true,
        postCount: 0
      },
      include: {
        blog: {
          select: {
            id: true,
            name: true,
            platform: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      category
    });
  } catch (error: any) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Failed to create category', message: error.message },
      { status: 500 }
    );
  }
}

// PATCH - 카테고리 업데이트
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, description, parentId, blogId, order, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (blogId !== undefined) updateData.blogId = blogId;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        blog: {
          select: {
            id: true,
            name: true,
            platform: true
          }
        },
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      category: {
        ...category,
        postCount: category._count.posts
      }
    });
  } catch (error: any) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'Failed to update category', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - 카테고리 삭제
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const categoryId = parseInt(id);

    // Check if category has posts
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (category._count.posts > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${category._count.posts} posts. Please move posts to another category first.` },
        { status: 400 }
      );
    }

    // Check if category has children
    const children = await prisma.category.count({
      where: { parentId: categoryId }
    });

    if (children > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${children} subcategories. Please delete or move subcategories first.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category', message: error.message },
      { status: 500 }
    );
  }
}
