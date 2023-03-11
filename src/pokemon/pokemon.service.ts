import { HttpCode, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { InternalServerErrorException } from '@nestjs/common/exceptions/internal-server-error.exception';
import { InjectModel } from '@nestjs/mongoose';
import { notContains } from 'class-validator';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}
  @HttpCode(HttpStatus.OK)
  async create(createPokemonDto: CreatePokemonDto) {
  
      try {
        const pokemon = await this.pokemonModel.create(createPokemonDto);
        return pokemon;
      } catch (error) {
        this.handleExceptions(error);
      }
   
    

  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon:Pokemon;
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({no:term})
      
    }
    if (isValidObjectId(term)) {
      pokemon= await this.pokemonModel.findById(term);
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({name:term.toLocaleLowerCase()});
    }

    if (!pokemon)
      throw new NotFoundException('No se encontró el pokemon')
      
    return pokemon;
    
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name) {
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }

    try {
       await pokemon.updateOne(updatePokemonDto, {new:true});
      return {...pokemon.toJSON(),...updatePokemonDto}; 
    } catch (error) {
        this.handleExceptions(error);
      
    }
  }
  async remove(id: string) {
    const pokemon = await this.findOne(id);
    this.pokemonModel.findByIdAndDelete(pokemon);
    return `This action removes a #${id} pokemon`;
  }

  private handleExceptions(error:any){
    if (error.code ===11000) {
      throw new BadRequestException(`El pokemon ya existe en la db ${JSON.stringify(error.keyValue)}`);  
    }
    throw new InternalServerErrorException(`Cant create Pokemon - Check server logs`);
  }
}
