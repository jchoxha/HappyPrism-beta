import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const TransformationPieChart = ({ subGoals }) => {
  const data = subGoals.map((subGoal, index) => ({
    name: subGoal.goal.goal_name,
    value: subGoal.percentOfTransformation,
    completion: subGoal.goal.percentComplete / 100,
    color: COLORS[index % COLORS.length],
  }));

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color}>
              <animate
                attributeName="opacity"
                from="0"
                to={entry.completion}
                dur="1s"
                repeatCount="1"
                fill="freeze"
              />
            </Cell>
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name, props) => [`${value.toFixed(2)}%`, props.payload.name]}
          labelFormatter={() => 'Sub-goal'}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export { TransformationPieChart, COLORS };