import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const HouseCard = ({ house, points, rank, maxPoints }) => {
  const isWinner = rank === 1;
  const progressPercentage = maxPoints > 0 ? (points / maxPoints) * 100 : 0;

  return (
    <Link to={`/house/${house.id}`} className="block">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          delay: rank * 0.1,
        }}
        whileHover={{
          scale: 1.02,
          translateY: -4,
        }}
        className={`
					relative overflow-hidden rounded-2xl bg-white shadow-lg border-2 transition-all
					${isWinner ? "border-amber-400 shadow-amber-100" : "border-transparent hover:border-slate-200"}
				`}
      >
        {isWinner && (
          <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 z-10">
            <Trophy className="w-3 h-3" /> IN THE LEAD
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-inner"
                style={{
                  backgroundColor: `${house.color}20`,
                  border: `2px solid ${house.color}`,
                }}
              >
                {house.iconEmoji}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  Rank {rank}
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {house.name}
                </h3>
              </div>
            </div>
            <div className="text-right">
              <motion.div
                className="text-4xl font-black"
                style={{
                  color: house.color,
                }}
                initial={{
                  scale: 0.5,
                }}
                animate={{
                  scale: 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                }}
              >
                {points.toLocaleString()}
              </motion.div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Points
              </div>
            </div>
          </div>

          <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                backgroundColor: house.color,
              }}
              initial={{
                width: 0,
              }}
              animate={{
                width: `${progressPercentage}%`,
              }}
              transition={{
                duration: 1,
                ease: "easeOut",
                delay: 0.2,
              }}
            />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default HouseCard;
