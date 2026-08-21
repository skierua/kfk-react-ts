import Box from '@mui/material/Box';
// import type BoxProps from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import type { DbRateType } from '../store/DbTypes';

interface RateTableProps {
  data: DbRateType[];
  showCSub?: boolean;
}

export const RateTable = (props: RateTableProps) => {
  const { data, showCSub } = props;
  return (
    <Paper>
      <table
        className="brd-table-component"
        // size="small"
        aria-label="a dense table"
      >
        <thead>
          <tr>
            <th align="center">назва</th>
            <th align="center">купівля</th>
            <th align="center">продаж</th>
          </tr>
        </thead>
        <tbody>
          {data.map((v) => {
            return (
              (Number(v.bid) !== 0 || Number(v.ask) !== 0) && (
                <tr>
                  <td align="center">
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: '0.5rem',
                      }}
                    >
                      <Box
                        component="img"
                        alt={v.chid}
                        src={`/flag/${v.atclcode}.svg`}
                      />
                      <div>{v.chid}</div>
                      {(showCSub || false) && (
                        <div style={{ fontSize: '70%' }}>{v.sname}</div>
                      )}
                    </Box>
                  </td>
                  <RateCell amnt={Number(v.bid)} />
                  <RateCell amnt={Number(v.ask)} />
                  {/* <td align="center"> {Number(v.bid).toPrecision(4)} </td> */}
                  {/* <td align="center"> {Number(v.ask).toPrecision(4)} </td> */}
                </tr>
              )
            );
          })}
        </tbody>
        {/* {footer && <RateTableFooter footer={footer} />} */}
      </table>
    </Paper>
  );
};

const RateCell = ({ amnt }: { amnt: number }) => {
  return <td>{amnt !== 0 ? amnt.toPrecision(4) : ''}</td>;
};

// const RateTableHead = () => {
//   return (
//     <TableHead >
//       <TableRow>
//         <TableCell align="center" padding={'none'}>
//           назва
//         </TableCell>
//         <TableCell
//           align="center"
//           padding={'none'}
//           // width={"18%"}
//           //   sx={{ bgcolor: colorset[0] }}
//         >
//           купівля
//         </TableCell>
//         <TableCell
//           align="center"
//           padding={'none'}
//           // width={"18%"}
//           //   sx={{ bgcolor: colorset[0] }}
//         >
//           продаж
//         </TableCell>
//       </TableRow>
//     </TableHead>
//   );
// };
// const RateTableFooter = ({
//   footer,
//   ...other
// }: { footer?: string }) => {
//   return (
//     <TableFooter {...other}>
//       <TableRow>
//         <TableCell align="center" colSpan={3}>
//           {footer}
//         </TableCell>
//       </TableRow>
//     </TableFooter>
//   );
// };
