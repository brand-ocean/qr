// Curated set of two-tone "Bulk" icons (kiesbeter icon library), wrapped so
// each one is a drop-in <Icon className="size-5" /> that inherits currentColor.
// SVGs live in ../../.icons-library/Bulk and are imported via vite-plugin-svgr.
import type { ComponentType, SVGProps } from 'react';
import AddSvg from '../../.icons-library/Bulk/Add Remove Delete/add-01.svg?react';
import CancelSvg from '../../.icons-library/Bulk/Add Remove Delete/cancel-01.svg?react';
import DeleteSvg from '../../.icons-library/Bulk/Add Remove Delete/delete-02.svg?react';
import AlertSvg from '../../.icons-library/Bulk/Alert Notification/alert-02.svg?react';
import ReloadSvg from '../../.icons-library/Bulk/Arrows (Round)/circle-arrow-reload-01-round.svg?react';
import ExternalSvg from '../../.icons-library/Bulk/Arrows (Round)/square-arrow-up-right-round.svg?react';
import ChartSvg from '../../.icons-library/Bulk/Business and Finance/chart-column.svg?react';
import CheckSvg from '../../.icons-library/Bulk/Check Validation/checkmark-circle-01.svg?react';
import DashboardSvg from '../../.icons-library/Bulk/Dashboard/dashboard-speed-01.svg?react';
import ClockSvg from '../../.icons-library/Bulk/Date and Time/time-04.svg?react';
import EditSvg from '../../.icons-library/Bulk/Edit Formatting/edit-02.svg?react';
import FilterSvg from '../../.icons-library/Bulk/Filter Sorting/filter-horizontal.svg?react';
import SortDownSvg from '../../.icons-library/Bulk/Filter Sorting/sort-by-down-01.svg?react';
import SortUpSvg from '../../.icons-library/Bulk/Filter Sorting/sort-by-up-01.svg?react';
import ImageSvg from '../../.icons-library/Bulk/Image Camera Video/image-01.svg?react';
import VideoSvg from '../../.icons-library/Bulk/Image Camera Video/video-01.svg?react';
import GridSvg from '../../.icons-library/Bulk/Layout Borders/layout-grid.svg?react';
import ListSvg from '../../.icons-library/Bulk/Layout Borders/layout-table-01.svg?react';
import LogoutSvg from '../../.icons-library/Bulk/Login Logout/logout-03.svg?react';
import PauseSvg from '../../.icons-library/Bulk/Media/pause.svg?react';
import PlaySvg from '../../.icons-library/Bulk/Media/play.svg?react';
import MoreSvg from '../../.icons-library/Bulk/More Menu/more-vertical.svg?react';
import SearchSvg from '../../.icons-library/Bulk/Search/search-02.svg?react';
import QrSvg from '../../.icons-library/Bulk/Security/qr-code.svg?react';
import MoonSvg from '../../.icons-library/Bulk/Weather/moon.svg?react';
import SunSvg from '../../.icons-library/Bulk/Weather/sun-03.svg?react';
import { BulkIcon } from './BulkIcon';

type IconProps = { className?: string; size?: number | string };

function make(svg: ComponentType<SVGProps<SVGSVGElement>>) {
  return function Icon({ className, size }: IconProps) {
    return <BulkIcon icon={svg} className={className} size={size} />;
  };
}

export const DashboardIcon = make(DashboardSvg);
export const GridIcon = make(GridSvg);
export const ListIcon = make(ListSvg);
export const SearchIcon = make(SearchSvg);
export const FilterIcon = make(FilterSvg);
export const SortDownIcon = make(SortDownSvg);
export const SortUpIcon = make(SortUpSvg);
export const AddIcon = make(AddSvg);
export const EditIcon = make(EditSvg);
export const DeleteIcon = make(DeleteSvg);
export const CancelIcon = make(CancelSvg);
export const PlayIcon = make(PlaySvg);
export const PauseIcon = make(PauseSvg);
export const VideoIcon = make(VideoSvg);
export const ImageIcon = make(ImageSvg);
export const AlertIcon = make(AlertSvg);
export const CheckIcon = make(CheckSvg);
export const ExternalIcon = make(ExternalSvg);
export const SunIcon = make(SunSvg);
export const MoonIcon = make(MoonSvg);
export const LogoutIcon = make(LogoutSvg);
export const ReloadIcon = make(ReloadSvg);
export const ClockIcon = make(ClockSvg);
export const ChartIcon = make(ChartSvg);
export const QrIcon = make(QrSvg);
export const MoreIcon = make(MoreSvg);
