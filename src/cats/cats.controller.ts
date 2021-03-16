import { Body, Controller, Get, Param, ParseIntPipe, Post, Redirect } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { CreateCatDto } from "./create-cat.dto";
import { CatsService } from "./cats.service";
import { Cat } from "./cat.interface";

@Controller('cats')
export class CatsController
{
    constructor(private catService: CatsService)
    {}

    @Post()
    addCat(@Body() createCatDto: CreateCatDto): CreateCatDto
    {
        this.catService.create(createCatDto);
        return createCatDto;
    }

    @Get()
    async findAll(): Promise<Array<Cat>>
    {
        return this.catService.findAll();
    }

    @Get('anggora')
    findFancyCat(): Observable<any[]>
    {
        let cats: Array<string> = ['luna', 'lucy', 'lina'];

        return of(cats);
    }

    @Get(':id')
    findById(@Param('id', ParseIntPipe) catId: number): string
    {
        console.log(catId);
        return `This is the cat with id = ${catId}`;
    }

    @Get('kampung')
    @Redirect('http://localhost:3000/cats', 301)
    redirect() {}
}
