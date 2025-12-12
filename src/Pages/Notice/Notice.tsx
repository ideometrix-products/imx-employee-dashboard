import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Notice {
  id: number;
  title: string;
  date: string;
  description: string;
}

const notices: Notice[] = [
  {
    id: 1,
    title: "Holiday Notice",
    date: "2025-05-04",
    description: "The office will be closed on Monday due to a public holiday.",
  },
  {
    id: 2,
    title: "Team Meeting",
    date: "2025-05-03",
    description: "There will be a team meeting at 10:00 AM in the main hall.",
  },
  {
    id: 3,
    title: "Updated Leave Policy",
    date: "2025-05-01",
    description:
      "Please check the updated leave policy effective from May 2025. Changes include casual leave count and carry forward limits.",
  },
];

const Notice = () => {
  return (
    <div className="p-2 space-y-3 max-w-8xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Company Notices</h2>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {notices.length} Active Notices
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notices.map((notice) => (
          <Card
            key={notice.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  {notice.title}
                </CardTitle>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {new Date(notice.date).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-600 text-sm leading-relaxed">
                {notice.description}
              </p>
              <div className="mt-4 flex justify-end">
                <button className="bg-[#334557] text-md text-white font-medium py-3 px-6 rounded-lg">
                  View Details →
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No active notices at this time</p>
        </div>
      )}
    </div>
  );
};

export default Notice;