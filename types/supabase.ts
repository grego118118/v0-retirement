export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      pension_calculations: {
        Row: {
          id: string
          user_id: string
          name: string
          service_entry_date: string
          age: string
          years_of_service: string
          group_type: string
          salary1: string
          salary2: string
          salary3: string
          retirement_option: string
          beneficiary_age: string | null
          result: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          service_entry_date: string
          age: string
          years_of_service: string
          group_type: string
          salary1: string
          salary2: string
          salary3: string
          retirement_option: string
          beneficiary_age?: string | null
          result: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          service_entry_date?: string
          age?: string
          years_of_service?: string
          group_type?: string
          salary1?: string
          salary2?: string
          salary3?: string
          retirement_option?: string
          beneficiary_age?: string | null
          result?: Json
          created_at?: string
          updated_at?: string
        }
      }
      users_metadata: {
        Row: {
          id: string
          full_name: string | null
          retirement_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          retirement_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          retirement_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
