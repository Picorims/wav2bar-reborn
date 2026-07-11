# Wav2Bar - Free software for creating audio visualization (motion design) videos
# Copyright (c) 2025-2026 Charly Schmidt aka Picorims<picorims.contact@gmail.com> and Wav2Bar contributors

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

import argparse
from io import StringIO
import pathlib
import sys
import csv
import matplotlib.hatch
from matplotlib.patches import Polygon
import matplotlib.pyplot as plt
import io
from fpdf import FPDF, XPos, YPos, Align, FontFace
from fpdf.enums import XPos, YPos, Align, TableCellFillMode, TextEmphasis

# Deprecated approach but no alternatives, and this is
# more self explanatory than default ones.
# see: https://github.com/matplotlib/matplotlib/issues/20690
square_path = Polygon(
    [
        [-0.3, -0.3],
        [-0.3, 0.3],
        [0.3, 0.3],
        [0.3, -0.3],
    ],
    closed=True, fill=False).get_path()

check_path = Polygon(
    [
        [-0.3, 0.25],
        [0.0, 0.05],
        [0.3, 0.55],
        [0.35, 0.5],
        [0.0, -0.05],
        [-0.35, 0.2],
    ],
    closed=True, fill=False).get_path()

cross_path = Polygon(
    [
        [0, 0.05],
        [0.35, 0.3],
        [0.3, 0.35],
        [0.05, 0],
        [0.35, -0.3],
        [0.3, -0.35],
        [0, -0.05],
        [-0.35, -0.3],
        [-0.3, -0.35],
        [-0.05, 0],
        [-0.35, 0.3],
        [-0.3, 0.35],
    ],
    closed=True, fill=False).get_path()

class SquareHatch(matplotlib.hatch.Shapes):
    """
    Custom hatches defined by a path drawn inside [-0.5, 0.5] square.
    Identifier '['.
    """
    filled = False
    size = 0.8
    path = square_path

    def __init__(self, hatch, density):
        self.num_rows = (hatch.count('[')) * density
        self.shape_vertices = self.path.vertices
        self.shape_codes = self.path.codes
        matplotlib.hatch.Shapes.__init__(self, hatch, density)

class CheckHatch(matplotlib.hatch.Shapes):
    """
    Custom hatches defined by a path drawn inside [-0.5, 0.5] square.
    Identifier 'v'.
    """
    filled = True
    size = 0.8
    path = check_path

    def __init__(self, hatch, density):
        self.num_rows = (hatch.count('v')) * density
        self.shape_vertices = self.path.vertices
        self.shape_codes = self.path.codes
        matplotlib.hatch.Shapes.__init__(self, hatch, density)

class CrossHatch(matplotlib.hatch.Shapes):
    """
    Custom hatches defined by a path drawn inside [-0.5, 0.5] square.
    Identifier 'f'.
    """
    filled = True
    size = 0.8
    path = cross_path

    def __init__(self, hatch, density):
        self.num_rows = (hatch.count('f')) * density
        self.shape_vertices = self.path.vertices
        self.shape_codes = self.path.codes
        matplotlib.hatch.Shapes.__init__(self, hatch, density)

matplotlib.hatch._hatch_types.append(SquareHatch)
matplotlib.hatch._hatch_types.append(CheckHatch)
matplotlib.hatch._hatch_types.append(CrossHatch)





def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-i', type=pathlib.Path, required=True, help="Input CSV test file path.")
    parser.add_argument('-o', type=pathlib.Path, required=True, help="Output PDF file path.")
    parser.add_argument('-t', type=str, required=True, help="Output PDF title.")

    args = vars(parser.parse_args())
    in_path = args["i"]
    out_path = args["o"]
    title = args["t"]
    
    if not pathlib.Path.exists(in_path):
        print("The input CSV file doesn't exist.")
        sys.exit()
    
    # read
    total = 0
    count = {
        "TODO": 0,
        "PASS": 0,
        "FAIL": 0,
        "NOT_TESTED": 0,
        "CANNOT_TEST": 0
    }
    colours_dict = {
        "TODO": "#57baf3",
        "PASS": "#5ee670",
        "FAIL": "#ff7c24",
        "NOT_TESTED": "#8ea5a1",
        "CANNOT_TEST": "#DC8AE7"
    }
    colours = [
        colours_dict["TODO"],
        colours_dict["PASS"],
        colours_dict["FAIL"],
        colours_dict["NOT_TESTED"],
        colours_dict["CANNOT_TEST"]
    ]
    hatches_colours = ["#275570", "#2c6934", "#753912", "#444e4d", "#644069"]
    hatches = ['[', 'v', 'f', '.', '/c']
    rows = []
    skipped_header = False
    
    with open(in_path) as csv_file:
        file = StringIO(csv_file.read().replace(", \"", ",\""))
        reader = csv.reader(file, delimiter=',', quotechar='"')
        for row in reader:
            if not skipped_header:
                skipped_header = True
                continue
            rows.append(row)
            key = row[1]
            if not key == "/":
                count[key] += 1
                total += 1
                
    # plot
    keys = count.keys()
    values = count.values()
    fig, ax = plt.subplots()
    patches, texts = ax.pie(values, colors=colours, hatch=hatches)
    for p,c in zip(patches, hatches_colours):
        p.set_edgecolor(c)
    labels = ['{0} - {1} ({2:1.1f} %)'.format(k,v,float(v) / total * 100) for k,v in zip(keys, values)]
    plt.legend(patches, labels, loc='lower center', bbox_to_anchor=(0.5, 0.9), ncols=2)

    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', bbox_inches='tight')
    buffer.seek(0)
    
    # pdf
    pdf_w = 210
    pdf_margin = 10
    pdf = FPDF()
    pdf.set_margin(pdf_margin)
    pdf.add_page()
    
    pdf.add_font("Poppins", style="", fname="../../src/lib/css/font/poppins/Poppins-Regular.woff")
    pdf.add_font("Poppins", style="b", fname="../../src/lib/css/font/poppins/Poppins-Bold.woff")
    pdf.add_font("Poppins", style="i", fname="../../src/lib/css/font/poppins/Poppins-Italic.woff")
    pdf.add_font("Poppins", style="bi", fname="../../src/lib/css/font/poppins/Poppins-BoldItalic.woff")
    
    pdf.set_font("Poppins", style="b", size=32)
    pdf.set_title(title)
    
    # title
    width = pdf.get_string_width(title)
    pdf.set_x((pdf_w - width) / 2)
    pdf.cell(text=title, new_x=XPos.CENTER, new_y=YPos.NEXT, align=Align.C)
    
    # chart
    pdf.ln()
    image_w = pdf_w - 2 * pdf_margin
    image_x = pdf_margin
    alt_text = "Pie chart of test results containing the following: {0}".format("; ".join(labels))
    pdf.image(buffer, w=image_w, h=100, x=image_x, keep_aspect_ratio=True, alt_text=alt_text)
    
    # table
    pdf.set_font("Poppins", style="", size=10)
    pdf.set_draw_color('#09415d')
    pdf.set_line_width(0.3)
    table_w = pdf_w - 2 * pdf_margin
    headings_style = FontFace(emphasis=TextEmphasis.B, color=255, fill_color="#09415d", )
    h1_style = FontFace(emphasis=TextEmphasis.B, color=255, fill_color="#066b93")
    h2_style = FontFace(emphasis=TextEmphasis.B, color=0, fill_color="#73c8f2")
    base_padding = (1,1,1,1)
    h2_padding = (1,1,1,4)
    
    table_data = []
    for row in rows:
        title: str = row[0]
        status: str = row[1]
        comment: str = row[2]
        new_row = [
            "",
            title.replace("# ", "").lstrip(),
            status.replace("_", " ").replace("/",""),
            comment
        ]
        if title.startswith("#"):
            new_row[0] = "h1"
        elif title.startswith("  - "):
            new_row[0] = "h2"
        else:
            lvl = title.count("  ")
            new_row[0] = "lvl{0}".format(lvl)
            if lvl % 2 == 0:
                new_row[1] = new_row[1].replace("- ", "* ")
        table_data.append(new_row)
    
    with pdf.table(
        borders_layout="NO_HORIZONTAL_LINES",
        cell_fill_color='#e8f6fd',
        cell_fill_mode=TableCellFillMode.ROWS,
        col_widths=(120, 20, 50),
        headings_style=headings_style,
        line_height=4,
        text_align=("LEFT", "CENTER", "LEFT"),
        width=table_w,
    ) as table:
        header = table.row()
        header.cell("Test", padding=base_padding)
        header.cell("Status", padding=base_padding)
        header.cell("Comment", padding=base_padding)
        for data_row in table_data:
            this_padding = base_padding
            row = table.row()
            lvl = -1
            
            # headers
            if data_row[0] == "h1":
                row.style = h1_style                
            elif data_row[0] == "h2":
                row.style = h2_style
                this_padding = h2_padding
            else:            
                # bodies
                lvl = int(data_row[0].replace("lvl", ""))
            
            i = -1
            for data_col in data_row:
                i += 1
                if i == 0: # meta
                    continue
                
                if i == 1: # title
                    if lvl != -1:
                        this_padding = (1,2,1,(lvl-1) * 8)
                else:
                    this_padding = base_padding
                
                if i == 2 and data_col != "": # status
                    style = FontFace(emphasis=TextEmphasis.B, fill_color=colours_dict[data_col.replace(" ", "_")])
                    row.cell(data_col, padding=this_padding, style=style)
                else:
                    row.cell(data_col, padding=this_padding)
                
    
    # commit
    pdf.output(out_path)
    

main()