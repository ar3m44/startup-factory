import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import { TaskDetail } from '@/components/ControlPanel/TaskDetail';
import { fixtureTasks } from '@/lib/fixtures/factory-fixtures';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function loadTaskContent(taskId: string): Promise<string | undefined> {
  try {
    const filePath = path.join(process.cwd(), 'factory/tasks', `${taskId}.md`);
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return undefined;
  }
}

async function loadReportContent(taskId: string): Promise<string | undefined> {
  try {
    const filePath = path.join(process.cwd(), 'factory/results', `${taskId}-REPORT.md`);
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const task = fixtureTasks.find(t => t.id === id);

  if (!task) {
    return { title: 'Task Not Found | Factory OS' };
  }

  return {
    title: `${task.id}: ${task.title} | Factory OS`,
    description: task.title,
  };
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { id } = await params;
  const task = fixtureTasks.find(t => t.id === id);

  if (!task) {
    notFound();
  }

  const [taskContent, reportContent] = await Promise.all([
    loadTaskContent(id),
    loadReportContent(id),
  ]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <TaskDetail
          task={task}
          taskContent={taskContent}
          reportContent={reportContent}
        />
      </div>
    </div>
  );
}
